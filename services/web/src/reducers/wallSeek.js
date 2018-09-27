import { fromJS } from 'immutable';

import { wallSeekPage } from '../store/initialState';
import {
	CREATE_SUCCESS, LIST_SUCCESS,
	REMOVE_SUCCESS, RESUME_SUCCESS,
} from '../actions/wallSeek';

//eslint-disable-next-line
export default (state = wallSeekPage, { type, payload }) => {
	if (type === CREATE_SUCCESS) {
		console.log(payload);
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
	
	if (type === REMOVE_SUCCESS) {
		const index = state.getIn(['list', 'items']).findIndex(item => item.get('_id') === payload.id);
		return state.deleteIn(['list', 'items', index]);
	}
	
	if (type === RESUME_SUCCESS) {
		const index = state.getIn(['list', 'items']).findIndex(item => item.get('_id') === payload.id);
		return state.updateIn(
			['list', 'items', index],
			task => task.set('status', 0),
		);
	}
	
	return state;
};
