import { auth } from '../store/initialState';
import {
	CREATE_CHAT_SUCCESS,
	GET_USER_BALANCE_SUCCESS,
	GET_USER_DATA_SUCCESS,
	LOGIN_SUCCESS,
	LOGOUT,
	NEED_LOGIN,
} from '../actions/auth';
import { ACTIVE_USERS_SUCCESS } from '../actions/vkUsers';

export default (authState = auth, { type, payload }) => {
	if (type === NEED_LOGIN && payload.lastRoute !== '/login') {
		return authState.update('lastRoute', () => payload.lastRoute);
	}

	if (type === LOGIN_SUCCESS) {
		return authState
			.update('jwt', () => payload.token)
			.update('email', () => payload.user.email);
	}

	if (type === LOGOUT) {
		return authState.update('jwt', () => null).update('email', () => '');
	}

	if (type === GET_USER_DATA_SUCCESS) {
		return authState
			.update('vkLink', () => payload.vkLink)
			.update('chatId', () => payload.chatId)
			.update('systemVkLink', () => payload.systemVkLink)
			.update('externalLinks', () => payload.externalLinks);
	}

	if (type === ACTIVE_USERS_SUCCESS) {
		return authState.update('activeUsersCount', () => payload.count);
	}

	if (type === GET_USER_BALANCE_SUCCESS) {
		return authState.update('balance', () => payload);
	}

	if (type === CREATE_CHAT_SUCCESS) {
		return authState
			.update('chatId', () => payload.chatId)
			.update('vkLink', () => payload.vkLink);
	}

	return authState;
};
