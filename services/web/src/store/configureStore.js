import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware                  from 'redux-thunk';
//eslint-disable-next-line import/no-extraneous-dependencies
import { composeWithDevTools }          from 'redux-devtools-extension';

import rootReducer from '../reducers';

export default (initialState = {}) => {
	const composedEnhancers = composeWithDevTools(applyMiddleware(thunkMiddleware));
	
	return createStore(rootReducer, initialState, composedEnhancers);
};
