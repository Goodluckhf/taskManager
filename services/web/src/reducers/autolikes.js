import { autoLikesPage }                         from '../store/initialState';
import { REQUEST_CREATE, CREATE_FAILED, CREATE } from '../actions/autolikes';

//eslint-disable-next-line
export default (state = autoLikesPage, { type, payload }) => {
	if (type === REQUEST_CREATE) {
		return state.updateIn(
			['form'],
			form => form.set('loading', true),
		);
	}
	
	if (type === CREATE_FAILED || type === CREATE) {
		console.log(payload);
		return state.updateIn(
			['form'],
			form => form
				.set('loading', false)
				.set('error', payload.error),
		);
	}
	
	return state;
};
