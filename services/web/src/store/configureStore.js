import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware             from 'redux-saga';
//eslint-disable-next-line import/no-extraneous-dependencies
import { composeWithDevTools }             from 'redux-devtools-extension';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import initialState from './initialState';
import rootReducer  from '../reducers';
import rootSage     from '../sagas';

export default (history) => {
	const sagaMiddleware = createSagaMiddleware();
	const middlewares    = applyMiddleware(
		sagaMiddleware,
		routerMiddleware(history),
	);
	const composedEnhancers = composeWithDevTools(middlewares);
	const store = createStore(connectRouter(history)(rootReducer), initialState, composedEnhancers);
	sagaMiddleware.run(rootSage);
	return store;
};
