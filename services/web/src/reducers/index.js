import { combineReducers } from 'redux';
import { routes }    from '../store/initialState';
import groupPage     from './groups';
import fatalError    from './fatalError';

export default combineReducers({
	routes: (state = routes) => state,
	groupPage,
	fatalError,
});
