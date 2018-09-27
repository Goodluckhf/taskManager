import BaseApiError from '../services/api/api/errors/BaseApiError';

/**
 * @property {VkApi} vkApi
 * @property {Logger} logger
 */
class Alert {
	constructor(vkApi, logger) {
		this.vkApi  = vkApi;
		this.logger = logger;
	}
	
	/**
	 * @param {Error | BaseApiError} error
	 * @param {String} chatId
	 * @return {Promise<*>}
	 */
	sendError(error, chatId) {
		if (!(error instanceof BaseApiError)) {
			//eslint-disable-next-line no-param-reassign
			error = new BaseApiError(error.message, 500).combine(error);
		}
		
		this.logger.warn({
			message: 'alert error',
			error,
		});
		
		return this.vkApi.apiRequest('messages.send', {
			chat_id: chatId,
			message: JSON.stringify(error.toObject()),
		});
	}
}

export default Alert;
