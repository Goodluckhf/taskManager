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
		
		const errorObject = error.toObject();
		
		const jsonError = JSON.stringify(errorObject.extraParams, null, 2);
		
		const displayError = `------------------\n${errorObject.message}\n${jsonError.replace(/(?:{\n)|(?:\n{)|(?:\n},?)|(?:},?\n)/g, '')}\n-----------------`;
		
		return this.vkApi.apiRequest('messages.send', {
			chat_id: chatId,
			message: displayError,
		});
	}
}

export default Alert;
