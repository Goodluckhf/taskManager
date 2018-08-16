import uuid from 'uuid';

/**
 * @property {Connection} connection
 * @property {Logger} logger
 * @property {*} answerQueueObject
 * @property {*} channel
 * @property {Map.<String, Object>} callbacks
 */
class RpcClient {
	constructor(mqConnection, logger) {
		this.connection        = mqConnection;
		this.logger            = logger;
		
		//@private
		this.answerQueueObject = null;
		this.channel           = null;
		this.callbacks         = new Map();
	}
	
	async start() {
		this.channel           = await this.connection.createChannel();
		this.answerQueueObject = await this.channel.assertQueue('', { exclusive: true });
		this.channel.consume(this.answerQueueObject.queue, (message) => {
			let result;
			let _error;
			try {
				result = JSON.parse(message.content.toString());
			} catch (error) {
				this.logger.error({ error });
				_error = error;
			}
			
			const error = _error || result.error || null;
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
				
				callback(error);
				this.callbacks.delete(id);
			}, timeout),
		});
	}
	
	/**
	 * @description Выполняет rpc вызов (Отправляет сообщение в очередь и ждет ответа)
	 * @param {Request} request
	 * @return {Promise<void>}
	 */
	async call(request) {
		return new Promise((resolve, reject) => {
			try {
				const message = request.toJSON();
				const id      = uuid();
				
				this.registerCallback(
					id,
					(error, result) => { return error ? reject(error) : resolve(result); },
					request.timeout,
					{ message },
				);
				
				this.channel.sendToQueue(request.queue, Buffer.from(message), {
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
