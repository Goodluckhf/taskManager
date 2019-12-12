import Response from './Response';

/**
 * @property {Amqp} amqp
 * @property {Logger} logger
 * @property {Map.<string, Response>} responses
 * @property {String} queue
 * @property {Number} prefetch
 * @property {Number} timeout
 * @property {Channel} channel
 * @property {GracefulStop} gracefulStop
 */
class RpcServer {
	constructor(amqp, logger, gracefulStop, { queue, prefetch, timeout = 10000 }) {
		this.amqp = amqp;
		this.logger = logger;
		this.gracefulStop = gracefulStop;
		this.prefetch = prefetch;
		this.timeout = timeout;
		this.queue = queue;

		this.responses = new Map();
		this.connection = null;
		this.channel = null;
	}

	/**
	 * @param {Response} response
	 * @return RpcServer
	 */
	addResponse(response) {
		if (!(response instanceof Response)) {
			throw new Error('response must be instance of Response');
		}

		if (this.responses.has(response.method)) {
			throw new Error('response has already exists');
		}

		this.responses.set(response.method, response);
		return this;
	}

	async start() {
		this.connection = await this.amqp.connect();
		this.channel = await this.connection.createChannel();

		await this.channel.assertQueue(this.queue);
		this.channel.prefetch(this.prefetch);

		return this.channel.consume(this.queue, async msg => {
			// Не начинаем делать следущую задачу
			// Если нужно выйти
			if (this.gracefulStop.isStopping) {
				return;
			}

			this.gracefulStop.setProcessing(this.queue);
			const result = {};
			try {
				const { method, args } = JSON.parse(msg.content.toString());
				const response = this.responses.get(method);
				if (!response) {
					const error = new Error('There is no response for this method');
					error.method = method;
					error.args = args;
					throw error;
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
					result.data = await response.process(args);
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

		await this.channel.sendToQueue(this.queue, msg.content, {
			...msg.properties,
			headers: { ...msg.properties.headers, 'X-Retry-Limit': String(retries - 1) },
		});
		this.channel.ack(msg);
		this.gracefulStop.setReady(this.queue);
		return true;
	}
}

export default RpcServer;
