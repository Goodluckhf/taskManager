import Response from './Response';

/**
 * @property {Amqp} amqp
 * @property {Logger} logger
 * @property {Map.<string, Response>} responses
 * @property {String} queue
 * @property {Number} prefetch
 * @property {Channel} channel
 * @property {GracefulStop} gracefulStop
 */
class RpcServer {
	constructor(amqp, logger, gracefulStop, { queue, prefetch }) {
		this.amqp          = amqp;
		this.logger        = logger;
		this.gracefulStop  = gracefulStop;
		this.prefetch      = prefetch;
		this.queue         = queue;
		
		this.responses  = new Map();
		this.connection = null;
		this.channel    = null;
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
		this.channel    = await this.connection.createChannel();
		
		await this.channel.assertQueue(this.queue);
		this.channel.prefetch(this.prefetch);
		
		return this.channel.consume(this.queue, async (msg) => {
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
					error.args   = args;
					throw error;
				}
				
				result.data = await response.process(args);
			} catch (error) {
				this.logger.error({ error });
				result.error = error.message ? error.message : error;
			}
			
			const formattedMessage = Buffer.from(JSON.stringify(result));
			this.channel.sendToQueue(
				msg.properties.replyTo,
				formattedMessage,
				{ correlationId: msg.properties.correlationId },
			);
			
			this.channel.ack(msg);
			this.gracefulStop.setReady(this.queue);
		});
	}
}

export default RpcServer;
