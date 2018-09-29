import { Map, fromJS } from 'immutable';
import { groupPage } from '../store/initialState';
import {
	CHANGE_IS_TARGET,
	CREATE_SUCCESS, FILTER_CHANGE_REQUEST,
	LIST_SUCCESS,
} from '../actions/groups';

export default (groupState = groupPage, { type, payload }) => {
	if (type === CREATE_SUCCESS) {
		return groupState
			.updateIn(
				['list', 'items'],
				items => items.push(Map(payload.group)),
			);
	}
	
	if (type === LIST_SUCCESS) {
		return groupState.updateIn(
			['list', 'items'],
			() => fromJS(payload.groups),
		);
	}
	
	if (type === CHANGE_IS_TARGET) {
		const index = groupState.getIn(['list', 'items']).findIndex(item => item.get('_id') === payload.id);
		return groupState.updateIn(
			['list', 'items', index],
			item => item.set('isTarget', payload.isTarget),
		);
	}
	
	if (type === FILTER_CHANGE_REQUEST) {
		return groupState.updateIn(
			['list', 'filter'],
			() => Map(payload.filterState),
		);
	}
	return groupState;
};
