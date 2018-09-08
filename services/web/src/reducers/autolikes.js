import { fromJS } from 'immutable';

import { autoLikesPage } from '../store/initialState';
import { CREATE_FAILURE, CREATE_SUCCESS, LIST_SUCCESS } from '../actions/autolikes';

//eslint-disable-next-line
export default (state = autoLikesPage, { type, payload }) => {
	if (type === CREATE_FAILURE) {
		return state.updateIn(
			['form'],
			form => form.set('error', payload.error),
		);
	}
	
	if (type === CREATE_SUCCESS) {
		return state.updateIn(
			['list', 'items'],
			items => items.push(fromJS(payload.task)),
		);
	}
	
	if (type === LIST_SUCCESS) {
		return state.updateIn(
			['list', 'items'],
			() => fromJS(payload.tasks),
		);
	}
	
	return state;
};
