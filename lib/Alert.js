/**
 * @property {VkApi} vkApi
 * @property {Logger} logger
 */
class Alert {
	constructor(vkApi, logger) {
		this.vkApi = vkApi;
		this.logger = logger;
	}

	/**
	 * @param {String} message
	 * @param {String} chatId
	 * @return {Promise<*>}
	 */
	sendError(message, chatId) {
		return this.vkApi.apiRequest('messages.send', {
			message,
			chat_id: chatId,
			dont_parse_links: 1,
		});
	}
}

export default Alert;
