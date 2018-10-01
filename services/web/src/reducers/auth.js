import { auth }                              from '../store/initialState';
import { LOGIN_SUCCESS, LOGOUT, NEED_LOGIN } from '../actions/auth';

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
	
	return authState;
};
