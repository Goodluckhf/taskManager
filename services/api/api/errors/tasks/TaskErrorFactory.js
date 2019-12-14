import {
	SetLikesValidation,
	CommonLikesError,
	SetCommentsValidation,
	CommonCommentsError,
	SetRepostsValidation,
	CommonRepostsError,
	CheckVkUserError,
} from './index';
import BaseTaskError from './BaseTaskError';

const statusToErrorMapper = {
	checkVkUser: {
		Default: CheckVkUserError,
	},
	likes: {
		1: SetLikesValidation,
		Default: CommonLikesError,
	},
	comments: {
		1: SetCommentsValidation,
		Default: CommonCommentsError,
	},
	reposts: {
		1: SetRepostsValidation,
		Default: CommonRepostsError,
	},
	Default: BaseTaskError,
};

class TaskErrorFactory {
	/**
	 * @property {String} type
	 * @property {Error} _error
	 */
	static createError(type, _error, ...args) {
		if (type === 'default') {
			return new statusToErrorMapper.Default(_error);
		}

		if (!_error.statusCode) {
			return new statusToErrorMapper[type].Default(...args, _error);
		}

		const ErrorClass = statusToErrorMapper[type][_error.statusCode];
		if (!ErrorClass) {
			const error = new statusToErrorMapper[type].Default(...args, _error);
			error.message = `Нет обработчика ошибки! ${error.message}`;
			throw error;
		}

		return new ErrorClass(...args, _error);
	}
}

export default TaskErrorFactory;
