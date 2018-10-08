import BaseApiError from './BaseApiError';

export default class TaskApiErrorAdapter {
	/**
	 * @param {BaseTaskError} error
	 * @param {Number} [status = 500]
	 * @return {BaseApiError}
	 */
	static createApiError(error, status = 500) {
		const apiError = new BaseApiError(error.message, status).combine(error);
		apiError.formattedMessage = error.toMessageString();
		return apiError;
	}
}
