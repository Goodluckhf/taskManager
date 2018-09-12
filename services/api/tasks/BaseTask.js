/**
 * @property {Logger} logger
 * @property {TaskDocument} taskDocument
 * @property {RpcClient} rpcClient
 * @property {Config} config
 */
class BaseTask {
	//eslint-disable-next-line object-curly-newline
	constructor({ logger, taskDocument, rpcClient, config }) {
		this.logger       = logger;
		this.taskDocument = taskDocument;
		this.rpcClient    = rpcClient;
		this.config       = config;
	}
	
	/**
	 * Базовый метод выполнения задачи
	 * Нужно переопределить
	 * @abstract
	 */
	//eslint-disable-next-line class-methods-use-this
	handle() {
		throw new Error('Must be override');
	}
}

export default BaseTask;
