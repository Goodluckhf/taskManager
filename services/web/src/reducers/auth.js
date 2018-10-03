import { auth }                                                                          from '../store/initialState';
import { CREATE_CHAT_SUCCESS, GET_USER_DATA_SUCCESS, LOGIN_SUCCESS, LOGOUT, NEED_LOGIN } from '../actions/auth';

export default (authState = auth, { type, payload }) => {
	if (type === NEED_LOGIN) {
		return authState.update('lastRoute', () => payload.lastRoute);
	}
	
	if (type === LOGIN_SUCCESS) {
		return authState
			.update('jwt', () => payload.token)
			.update('email', () => payload.user.email);
	}
	
	if (type === LOGOUT) {
		return authState
			.update('jwt', () => null)
			.update('email', () => '');
	}
	
	if (type === GET_USER_DATA_SUCCESS) {
		return authState
			.update('vkLink', () => payload.vkLink)
			.update('chatId', () => payload.chatId);
	}
	
	if (type === CREATE_CHAT_SUCCESS) {
		return authState
			.update('chatId', () => payload.chatId)
			.update('vkLink', () => payload.vkLink);
	}
	
	return authState;
};
