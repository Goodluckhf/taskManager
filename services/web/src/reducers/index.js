import { combineReducers } from 'redux';
import { routes } from '../store/initialState';

export default combineReducers({
	routes: (state = routes) => state,
});
