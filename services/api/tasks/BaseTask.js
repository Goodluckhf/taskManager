import PremiumAccount from '../billing/PremiumAccount';

/**
 * @property {Logger} logger
 * @property {TaskDocument} taskDocument
 * @property {RpcClient} rpcClient
 * @property {Config} config
 * @property {Billing} billing
 * @property {BaseAccount} account
 */
class BaseTask {
	//eslint-disable-next-line object-curly-newline
	constructor({ logger, taskDocument, rpcClient, config, billing, account }) {
		this.logger       = logger;
		this.taskDocument = taskDocument;
		this.rpcClient    = rpcClient;
		this.config       = config;
		this.billing      = billing;
		this.account      = account;
	}
	
	/**
	 * @TODO: Вынести в другое место
	 * Возвращает доступы для сервисов
	 * Либо дефолтные либо берет у пользователя
	 * @param {String} service
	 * @return {Object}
	 */
	getCredentialsForService(service) {
		if (this.account instanceof PremiumAccount) {
			const userService = this.taskDocument.user.services[service];
			return userService.toObject();
		}
		
		return this.config.get(service);
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
