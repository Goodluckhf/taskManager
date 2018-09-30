import { auth }       from '../store/initialState';
import { NEED_LOGIN } from '../actions/auth';

export default (authState = auth, { type, payload }) => {
	if (type === NEED_LOGIN) {
		return authState.update('lastRoute', () => payload.lastRoute);
	}
	
	return authState;
};
