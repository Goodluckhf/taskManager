import { combineReducers } from 'redux';
import { routes }    from '../store/initialState';
import groupPage     from './groups';
import autoLikesPage from './autolikes';
import wallSeekPage  from './wallSeek';
import fatalError    from './fatalError';
import { loaderReducer, errorReducer } from '../lib/loader';

export default combineReducers({
	routes: (state = routes) => state,
	groupPage,
	autoLikesPage,
	wallSeekPage,
	fatalError,
	loader: loaderReducer,
	error : errorReducer,
});
