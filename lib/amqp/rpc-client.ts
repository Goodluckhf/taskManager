import uuid from 'uuid';
import { Connection, Channel } from 'amqplib';
import { inject, injectable } from 'inversify';
import { AmqpAdapterInterface } from './amqp-adapter.interface';
import { AmqpAdapter } from './amqp-adapter';
import { LoggerInterface } from '../logger.interface';
import { CallbackInterface } from './callback.interface';
import { TimeoutException } from './timeout.exception';
import { AbstractRpcRequest } from './abstract-rpc-request';

@injectable()
class RpcClient {
	private readonly answerQueue = 'amq.rabbitmq.reply-to';

	private connection: Connection = null;

	private channel: Channel = null;

	private readonly callbacks: Map<string, CallbackInterface> = new Map();

	constructor(
		@inject(AmqpAdapter) private readonly amqpAdapter: AmqpAdapterInterface,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async start() {
		this.connection = await this.amqpAdapter.connect();
		this.channel = await this.connection.createChannel();

		await this.channel.consume(
			this.answerQueue,
			message => {
				let result;
				let _error;
				try {
					result = JSON.parse(message.content.toString());
				} catch (error) {
					this.logger.error({ error });
					_error = error;
				}

				const error = this.createError(_error, result);
				this.applyCallback(message.properties.correlationId, error, result.data);
			},
			{ noAck: true },
		);
	}

	createError(parseError, result) {
		if (parseError) {
			return parseError;
		}

		if (!result.error) {
			return null;
		}

		const { message, ...errorData } = result.error;

		return {
			message: result.error.message || 'Something went wrong',
			...errorData,
		};
	}

	private applyCallback(id: string, error, result) {
		const callback = this.callbacks.get(id);
		if (!callback) {
			this.logger.error({
				message: 'callback not found',
				id,
				error,
				result,
			});
			return;
		}

		this.callbacks.delete(id);
		if (callback.timeout) {
			clearTimeout(callback.timeout);
		}

		callback.callback(error, result);
	}

	private registerCallback(id: string, callback: Function, timeout: number, opts) {
		this.callbacks.set(id, {
			id,
			callback,
			timeout: setTimeout(() => {
				this.callbacks.delete(id);
				callback(new TimeoutException(id, opts));
			}, timeout),
		});
	}

	/**
	 * @description Выполняет rpc вызов (Отправляет сообщение в очередь и ждет ответа)
	 */
	async call<T>(request: AbstractRpcRequest): Promise<T> {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			try {
				const message = request.getMessageJSON();

				this.registerCallback(
					request.getId(),
					(error, result) => (error ? reject(error) : resolve(result)),
					request.getTimeout(),
					{ message: JSON.parse(message) },
				);

				try {
					await this.channel.assertQueue(request.getQueue(), {
						durable: true,
						maxPriority: 5,
					});

					this.channel.sendToQueue(request.getQueue(), Buffer.from(message), {
						headers: {
							'X-Retry-Limit': request.getRetriesLimit(),
							'X-Trace-Id': request.getId(),
						},
						correlationId: request.getId(),
						replyTo: this.answerQueue,
						persistent: true,
						priority: request.getPriority(),
					});
				} catch (error) {
					this.logger.error({ error });
					throw error;
				}
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default RpcClient;
