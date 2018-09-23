import BaseApiError from '../services/api/api/errors/BaseApiError';

class Alert {
	constructor(vkApi) {
		this.vkApi = vkApi;
	}
	
	sendError(error, chatId) {
		if (!(error instanceof BaseApiError)) {
			//eslint-disable-next-line no-param-reassign
			error = new BaseApiError(error.message, 500).combine(error);
		}
		
		return this.vkApi.apiRequest('messages.send', {
			chat_id: chatId,
			message: JSON.stringify(error.toObject()),
		});
	}
}

export default Alert;
