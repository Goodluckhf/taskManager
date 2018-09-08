import { Map, fromJS } from 'immutable';
import { groupPage } from '../store/initialState';
import {
	CHANGE_IS_TARGET,
	CREATE_SUCCESS, CREATE_FAILURE,
	LIST_SUCCESS, CREATE_REQUEST,
} from '../actions/groups';

export default (groupState = groupPage, { type, payload }) => {
	if (type === CREATE_SUCCESS) {
		return groupState
			.updateIn(
				['list', 'items'],
				items => items.push(Map(payload.group)),
			)
			.updateIn(
				['form'],
				form => form.set('error', null),
			);
	}
	
	if (type === CREATE_REQUEST) {
		return groupState.updateIn(
			['form'],
			form => form.set('error', null),
		);
	}
	
	if (type === CREATE_FAILURE) {
		return groupState.updateIn(
			['form'],
			form => form.set('error', payload.error),
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
	return groupState;
};
