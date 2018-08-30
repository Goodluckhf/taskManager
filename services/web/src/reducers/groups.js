import { groups }    from '../store/initialState';
import { ADD_GROUP } from '../actions/groups';

export default (groupState = groups, action) => {
	if (action.type === ADD_GROUP) {
		return groupState.push([action.payload.link]);
	}
	
	return groupState;
};
