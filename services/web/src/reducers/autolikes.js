import { fromJS } from 'immutable';

import { autoLikesPage } from '../store/initialState';
import {
	CREATE_SUCCESS,
	FILTER_CHANGE_REQUEST,
	LIST_SUCCESS,
	REMOVE_SUCCESS,
	STOP_SUCCESS,
	RESUME_SUCCESS,
} from '../actions/autolikes';

//eslint-disable-next-line
export default (state = autoLikesPage, { type, payload }) => {
	if (type === CREATE_SUCCESS) {
		return state.updateIn(['list', 'items'], items => items.push(fromJS(payload.task)));
	}

	if (type === LIST_SUCCESS) {
		return state.updateIn(['list', 'items'], () => fromJS(payload.tasks));
	}

	if (type === STOP_SUCCESS) {
		const index = state
			.getIn(['list', 'items'])
			.findIndex(item => item.get('_id') === payload.id);
		return state.updateIn(
			['list', 'items', index],
			item => item.set('status', 3), //@TODO: Вынести в константу
		);
	}

	if (type === REMOVE_SUCCESS) {
		const index = state
			.getIn(['list', 'items'])
			.findIndex(item => item.get('_id') === payload.id);
		return state.deleteIn(['list', 'items', index]);
	}

	if (type === FILTER_CHANGE_REQUEST) {
		return state.updateIn(['list', 'filter'], () => payload.filterState.filter);
	}

	if (type === RESUME_SUCCESS) {
		const index = state
			.getIn(['list', 'items'])
			.findIndex(item => item.get('_id') === payload.id);
		return state.updateIn(['list', 'items', index], task => task.set('status', 0));
	}

	return state;
};
