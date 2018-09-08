import { combineReducers } from 'redux';
import { routes }    from '../store/initialState';
import groupPage     from './groups';
import autoLikesPage from './autolikes';
import fatalError    from './fatalError';
import { loaderReducer, errorReducer } from '../lib/loader';

export default combineReducers({
	routes: (state = routes) => state,
	groupPage,
	autoLikesPage,
	fatalError,
	loader: loaderReducer,
	error : errorReducer,
});
