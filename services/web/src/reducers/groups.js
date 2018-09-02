import { Map, fromJS } from 'immutable';
import { groupPage } from '../store/initialState';
import {
	CHANGE_IS_TARGET,
	CREATE, CREATE_FAILED, LIST,
	REQUEST_CREATE, REQUEST_LIST,
} from '../actions/groups';

export default (groupState = groupPage, { type, payload }) => {
	if (type === CREATE) {
		return groupState
			.updateIn(
				['list', 'items'],
				items => items.push(Map(payload.group)),
			)
			.updateIn(
				['form'],
				form => form
					.set('loading', false)
					.set('error', null),
			);
	}
	
	if (type === REQUEST_CREATE) {
		return groupState.updateIn(
			['form'],
			form => form
				.set('loading', true)
				.set('error', null),
		);
	}
	
	if (type === CREATE_FAILED) {
		return groupState.updateIn(
			['form'],
			form => form
				.set('loading', false)
				.set('error', payload.error),
		);
	}
	
	if (type === REQUEST_LIST) {
		return groupState.updateIn(
			['list'],
			list => list
				.set('loading', true),
		);
	}
	
	if (type === LIST) {
		return groupState.updateIn(
			['list'],
			list => list.set('loading', false),
		).updateIn(
			['list', 'items'],
			items => items.clear().concat(fromJS(payload.groups)),
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
