/**
 * @property {Logger} logger
 * @property {TaskDocument} task
 * @property {Config} config
 */
class BaseTask {
	constructor(logger, taskDocument, rpcClient, config) {
		this.logger    = logger;
		this.task      = taskDocument;
		this.rpcClient = rpcClient;
		this.config    = config;
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
