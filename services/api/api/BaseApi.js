import Ajv                 from 'ajv';
import { ValidationError } from './errors';

/**
 * @property {String} config
 * @property {VkApi} vkApi
 * @property {Logger} logger
 */
class BaseApi {
	constructor(config, vkApi, logger) {
		this.config = config;
		this.vkApi  = vkApi;
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
}

export default BaseApi;
