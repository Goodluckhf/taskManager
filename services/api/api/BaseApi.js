import Ajv                                 from 'ajv';
import { UserIsNotReady, ValidationError } from './errors';

/**
 * @property {String} config
 * @property {Logger} logger
 */
class BaseApi {
	constructor(config, logger) {
		this.config = config;
		this.logger = logger;
	}
	
	/**
	 * @param {Object<*>} rules
	 * @param {Object<*>} values
	 * @throws ValidationError
	 */
	// eslint-disable-next-line class-methods-use-this
	validate(rules, values) {
		const ajv = new Ajv();
		const validate = ajv.validate(rules, values);
		if (!validate) {
			throw new ValidationError(ajv.errors);
		}
	}
	
	/**
	 * Проверяет готов ли аккаунт и созданию задач
	 * Необходимо заполнить токены
	 * @param {UserDocument} user
	 */
	//eslint-disable-next-line class-methods-use-this
	checkUserReady(user) {
		if (!user.chatId) {
			throw new UserIsNotReady(['chatId']);
		}
	}
}

export default BaseApi;
