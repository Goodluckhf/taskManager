/**
 * @property {Connection} mqConnection
 * @property {Logger} logger
 * @property {String} queue
 * @property {Channel} channel
 */
class RpcServer {
	constructor(mqConnection, logger, { queue, prefetch = 1 } = {}) {
		this.connection = mqConnection;
		this.logger = logger;
		
		// Config
		this.queueName = queue;
		this.prefetch  = prefetch;
		
		this.channel = null;
	}
	
	async start() {
		this.channel = await this.connection.createChannel();
		await this.channel.assertQueue(this.queueName);
		this.channel.prefetch(this.prefetch);
		this.channel.consume(this.queueName, async (msg) => {
			const result = {};
			try {
				//@TODO: Доделать как сюда будет попадать таск
				//result.data = await do();
				result.data = {};
			} catch (error) {
				result.error = error;
			}
			
			const formattedMessage = Buffer.from(JSON.stringify(result));
			this.channel.sendToQueue(
				msg.properties.replyTo,
				formattedMessage,
				{ correlationId: msg.properties.correlationId },
			);
			
			this.channel.ack(msg);
		});
	}
}

export default RpcServer;
