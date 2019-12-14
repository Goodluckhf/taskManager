import { combineReducers } from 'redux';
import { routes } from '../store/initialState';
import groupPage from './groups';
import autoLikesPage from './autolikes';
import wallSeekPage from './wallSeek';
import commentsByStrategyPage from './commentsByStrategy';
import vkUsersPage from './vkUsers';
import fatalError from './fatalError';
import auth from './auth';
import billingPage from './billing';
import { loaderReducer, errorReducer } from '../lib/loader';

export default combineReducers({
	routes: (state = routes) => state,
	auth,
	groupPage,
	autoLikesPage,
	wallSeekPage,
	commentsByStrategyPage,
	vkUsersPage,
	billingPage,
	fatalError,
	loader: loaderReducer,
	error: errorReducer,
});
