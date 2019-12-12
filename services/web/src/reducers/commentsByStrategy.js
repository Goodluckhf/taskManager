import { fromJS } from 'immutable';

import { commentsByStrategyPage } from '../store/initialState';
import {
	CREATE_SUCCESS,
	LIST_SUCCESS,
	REMOVE_SUCCESS,
	RESUME_SUCCESS,
} from '../actions/commentsByStrategy';

//eslint-disable-next-line
export default (state = commentsByStrategyPage, { type, payload }) => {
	if (type === CREATE_SUCCESS) {
		return state.updateIn(['list', 'items'], items => items.insert(0, fromJS(payload.task)));
	}

	if (type === LIST_SUCCESS) {
		return state.updateIn(['list', 'items'], () => fromJS(payload.tasks));
	}

	if (type === REMOVE_SUCCESS) {
		const index = state
			.getIn(['list', 'items'])
			.findIndex(item => item.get('_id') === payload.id);
		return state.deleteIn(['list', 'items', index]);
	}

	if (type === RESUME_SUCCESS) {
		const index = state
			.getIn(['list', 'items'])
			.findIndex(item => item.get('_id') === payload.id);
		return state.updateIn(['list', 'items', index], task => task.set('status', 0));
	}

	return state;
};
