import uuid from 'uuid';

/**
 * @property {Connection} connection
 * @property {Logger} logger
 * @property {*} answerQueueObject
 * @property {*} channel
 * @property {Map.<String, Object>} callbacks
 * @property {Number} timeout
 */
class RpcClient {
	constructor(mqConnection, logger, { timeout = 60000 } = {}) {
		this.connection        = mqConnection;
		this.logger            = logger;
		this.timeout           = timeout;
		
		//@private
		this.answerQueueObject = null;
		this.channel           = null;
		this.callbacks         = new Map();
	}
	
	async start() {
		this.channel           = await this.connection.createChannel();
		this.answerQueueObject = await this.channel.channel.assertQueue('', { exclusive: true });
		this.channel.channel.consume(this.answerQueueObject.queue, (message) => {
			let result;
			try {
				result = JSON.parse(message.content.toString());
			} catch (error) {
				this.logger.error({ error });
			}
			
			const error = result.error || null;
			this.applyCallback(message.correlationId, error, result.data);
		}, { noAck: true });
	}
	
	/**
	 * @param {String} id
	 * @param {Error?} error
	 * @param {*} result
	 * @return {void}
	 * @private
	 */
	applyCallback(id, error, result) {
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
	
	/**
	 * @param {String} id
	 * @param {Function} callback
	 * @return void
	 * @private
	 */
	registerCallback(id, callback, opts) {
		this.callbacks.set(id, {
			id,
			callback,
			timeout: setTimeout(() => {
				const error = new Error('task Timeout');
				error.id   = id;
				error.opts = opts;
				
				callback(error);
				this.callbacks.delete(id);
			}, this.timeout),
		});
	}
	
	/**
	 * @description Отправляет сообщение в очередь и ждет ответа
	 * @param {*} message
	 * @param {String} queue
	 * @return {Promise<void>}
	 */
	async sendMessage(message, queue) {
		return new Promise((resolve, reject) => {
			try {
				const formattedMessage = Buffer.from(JSON.stringify(message));
				const id = uuid();
				this.registerCallback(
					id,
					(error, result) => { return error ? reject(error) : resolve(result); },
					{ message },
				);
				
				this.channel.sendToQueue(queue, formattedMessage, {
					correlationId: id,
					replyTo      : this.answerQueueObject.queue,
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default RpcClient;
