import { combineReducers } from 'redux-immutable';
import { routes } from '../store/initialState';

export default combineReducers({
	routes: (state = routes) => state,
});
