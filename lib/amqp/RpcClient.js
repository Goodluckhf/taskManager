import uuid from 'uuid';

/**
 * @property {Amqp} amqp
 * @property {Logger} logger
 * @property {Connection} connection
 * @property {*} answerQueue
 * @property {*} channel
 * @property {Map.<String, Object>} callbacks
 */
class RpcClient {
	constructor(amqp, logger) {
		this.amqp   = amqp;
		this.logger = logger;
		
		//@private
		this.connection  = null;
		this.answerQueue = 'amq.rabbitmq.reply-to';
		this.channel     = null;
		this.callbacks   = new Map();
	}
	
	async start() {
		this.connection  = await this.amqp.connect();
		this.channel     = await this.connection.createChannel();
		
		this.channel.consume(this.answerQueue, (message) => {
			let result;
			let _error;
			try {
				result = JSON.parse(message.content.toString());
			} catch (error) {
				this.logger.error({ error });
				_error = error;
			}
			
			const error = _error || result.error ? new Error(result.error) : null;
			this.applyCallback(message.properties.correlationId, error, result.data);
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
	 * @param {Number} timeout
	 * @param {Object} opts
	 * @return void
	 * @private
	 */
	registerCallback(id, callback, timeout, opts) {
		this.callbacks.set(id, {
			id,
			callback,
			timeout: setTimeout(() => {
				const error = new Error('task Timeout');
				error.id   = id;
				error.opts = opts;
				
				this.callbacks.delete(id);
				callback(error);
			}, timeout),
		});
	}
	
	/**
	 * @description Выполняет rpc вызов (Отправляет сообщение в очередь и ждет ответа)
	 * @param {Request} request
	 * @return {Promise<void>}
	 */
	async call(request) {
		return new Promise(async (resolve, reject) => {
			try {
				const message = request.toJson();
				const id      = uuid();
				
				this.registerCallback(
					id,
					(error, result) => (error ? reject(error) : resolve(result)),
					request.timeout,
					{ message: JSON.parse(message) },
				);
				
				try {
					await this.channel.assertQueue(request.queue);
					await this.channel.sendToQueue(request.queue, Buffer.from(message), {
						correlationId: id,
						replyTo      : this.answerQueue,
					}, { persistent: true });
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
