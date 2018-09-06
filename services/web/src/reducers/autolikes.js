import { fromJS } from 'immutable';

import { autoLikesPage } from '../store/initialState';
import {
	REQUEST_CREATE, CREATE_FAILED,
	CREATE, LIST,
} from '../actions/autolikes';

//eslint-disable-next-line
export default (state = autoLikesPage, { type, payload }) => {
	if (type === REQUEST_CREATE) {
		return state.updateIn(
			['form'],
			form => form.set('loading', true),
		);
	}
	
	if (type === CREATE_FAILED) {
		return state.updateIn(
			['form'],
			form => form
				.set('loading', false)
				.set('error', payload.error),
		);
	}
	
	if (type === CREATE) {
		return state.updateIn(
			['list', 'items'],
			items => items.push(payload.task),
		).updateIn(
			['form'],
			form => form.set('loading', false),
		);
	}
	
	if (type === LIST) {
		return state.updateIn(
			['list'],
			() => fromJS(payload.tasks),
		);
	}
	
	return state;
};
