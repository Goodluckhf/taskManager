import { combineReducers } from 'redux-immutable';
import { routes } from '../store/initialState';
import groups     from './groups';

export default combineReducers({
	routes: (state = routes) => state,
	groups,
});
