import { combineReducers } from 'redux';
import { routes }    from '../store/initialState';
import groupPage     from './groups';
import autoLikesPage from './autolikes';
import fatalError    from './fatalError';

export default combineReducers({
	routes: (state = routes) => state,
	groupPage,
	autoLikesPage,
	fatalError,
});
