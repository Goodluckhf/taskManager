import { groupPage }                             from '../store/initialState';
import { CREATE, CREATE_FAILED, REQUEST_CREATE } from '../actions/groups';

export default (groupState = groupPage, action) => {
	if (action.type === CREATE) {
		groupState
			.updateIn(
				['list', 'items'],
				items => items.push(action.payload.group),
			)
			.updateIn(
				['form'],
				form => form
					.set('loading', false)
					.set('error', null),
			);
	}
	
	if (action.type === REQUEST_CREATE) {
		return groupState.updateIn(
			['form'],
			form => form
				.set('loading', true)
				.set('error', null),
		);
	}
	
	if (action.type === CREATE_FAILED) {
		return groupState.updateIn(
			['form'],
			form => form
				.set('loading', false)
				.set('error', action.payload.error),
		);
	}
	
	return groupState;
};
