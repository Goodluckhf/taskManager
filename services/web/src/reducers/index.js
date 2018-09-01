import { combineReducers } from 'redux';
import { routes }    from '../store/initialState';
import groupPage     from './groups';

export default combineReducers({
	routes: (state = routes) => state,
	groupPage,
});
