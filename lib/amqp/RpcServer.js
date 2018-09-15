/**
 * @property {Amqp} amqp
 * @property {Logger} logger
 * @property {Response} response
 * @property {String} queue
 * @property {Channel} channel
 * @property {GracefulStop} gracefulStop
 */
class RpcServer {
	constructor(amqp, logger, response, gracefulStop) {
		this.amqp          = amqp;
		this.logger        = logger;
		this.response      = response;
		this.gracefulStop  = gracefulStop;
		
		this.connection = null;
		this.channel    = null;
	}
	
	async start() {
		this.connection = await this.amqp.connect();
		this.channel    = await this.connection.createChannel();
		
		await this.channel.assertQueue(this.response.queue);
		this.channel.prefetch(this.response.prefetch);
		
		return this.channel.consume(this.response.queue, async (msg) => {
			this.gracefulStop.setProcessing(this.response.toString());
			const result = {};
			try {
				const { method, args } = JSON.parse(msg.content.toString());
				result.data = await this.response.process(method, args);
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
			this.gracefulStop.setReady(this.response.toString());
		});
	}
}

export default RpcServer;
