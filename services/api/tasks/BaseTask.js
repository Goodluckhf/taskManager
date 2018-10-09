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
	 * @TODO: Вынести в другое место
	 * Возвращает доступы для сервисов
	 * Либо дефолтные либо берет у пользователя
	 * @param {String} service
	 * @return {Object}
	 */
	getCredentialsForService(service) {
		const userService = this.taskDocument.user.services[service];
		const defaultCredentials = this.config.get(`${service}`);
		if (!userService) {
			return defaultCredentials;
		}
		
		return userService.toObject();
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
