import { inject, injectable, interfaces, multiInject } from 'inversify';
import { Channel, Connection } from 'amqplib';
import { AmqpAdapter } from './amqp-adapter';
import { LoggerInterface } from '../logger.interface';
import GracefulStop from '../graceful-stop';
import { ConfigInterface } from '../../config/config.interface';
import { AbstractRpcHandler } from './abstract-rpc-handler';
import { HandlerNotRegisterException } from './handler-not-register.exception';

@injectable()
export class RpcServer {
	private readonly prefetch: number;

	private readonly timeout: number;

	private readonly queue: string;

	private connection: Connection = null;

	private channel: Channel = null;

	private rpcHandlerMap: Map<string, typeof AbstractRpcHandler> = new Map();

	constructor(
		@inject(AmqpAdapter) private readonly amqpAdapter: AmqpAdapter,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(GracefulStop) private readonly gracefulStop: GracefulStop,
		@inject('Config') private readonly config: ConfigInterface,
		@multiInject(AbstractRpcHandler)
		private readonly rpcHandlerClasses: typeof AbstractRpcHandler[],
	) {
		this.prefetch = this.config.get('tasksQueue.prefetch');
		this.timeout = this.config.get('tasksQueue.timeout') || 10000;
		this.queue = this.config.get('tasksQueue.name');
		rpcHandlerClasses.forEach((rpcHandler: typeof AbstractRpcHandler) => {
			this.rpcHandlerMap.set(rpcHandler.method, rpcHandler);
		});
	}

	async start(container: interfaces.Container) {
		this.connection = await this.amqpAdapter.connect();
		this.channel = await this.connection.createChannel();

		await this.channel.assertQueue(this.queue);
		await this.channel.prefetch(this.prefetch);

		return this.channel.consume(this.queue, async msg => {
			// Не начинаем делать следущую задачу
			// Если нужно выйти
			if (this.gracefulStop.isStopping) {
				return;
			}

			this.gracefulStop.setProcessing(this.queue);
			const result: { data?: object; error?: Error } = {};
			try {
				const { method, args } = JSON.parse(msg.content.toString());
				const handlerClass = this.rpcHandlerMap.get(method);
				const traceId = msg.properties.headers['X-Trace-Id'];
				container.bind('TraceId').toConstantValue(traceId);
				container.rebind('Logger').toConstantValue(this.logger.child({ traceId }));
				const handler = container.get<AbstractRpcHandler>(handlerClass);
				if (!handler) {
					throw new HandlerNotRegisterException(method, args);
				}
				const timeout = setTimeout(() => {
					this.logger.warn({
						message: 'Rpc server timeout',
						method,
						args,
					});
					this.gracefulStop.forceStop();
				}, this.timeout);
				try {
					result.data = await handler.handle(args);
				} catch (error) {
					const shouldRetry = await this.shouldRetry(error, msg, { method, args });
					if (shouldRetry) {
						return;
					}

					throw error;
				} finally {
					clearTimeout(timeout);
				}
			} catch (error) {
				this.logger.error({ error });
				result.error = {
					message: error.message,
					...error,
				};
			}

			let json = null;
			try {
				json = JSON.stringify(result);
			} catch (error) {
				json = JSON.stringify({
					error: {
						...error,
						message: 'Не предвиденная ошибка',
						originMessage: error.message,
					},
				});
			}

			const formattedMessage = Buffer.from(json);
			this.channel.sendToQueue(msg.properties.replyTo, formattedMessage, {
				correlationId: msg.properties.correlationId,
			});

			this.channel.ack(msg);
			this.gracefulStop.setReady(this.queue);
		});
	}

	async shouldRetry(error, msg, data) {
		if (!error.canRetry) {
			return false;
		}

		if (
			!msg.properties.headers ||
			typeof msg.properties.headers['X-Retry-Limit'] === 'undefined'
		) {
			return false;
		}

		const retries = parseInt(msg.properties.headers['X-Retry-Limit'], 10);
		if (retries <= 0) {
			return false;
		}

		this.logger.warn({
			message: 'RPC server retry message',
			retryLimit: retries,
			...data,
		});

		this.channel.sendToQueue(this.queue, msg.content, {
			...msg.properties,
			headers: { ...msg.properties.headers, 'X-Retry-Limit': String(retries - 1) },
		});
		this.channel.ack(msg);
		this.gracefulStop.setReady(this.queue);
		return true;
	}
}
