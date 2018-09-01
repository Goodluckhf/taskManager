import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware             from 'redux-saga';
//eslint-disable-next-line import/no-extraneous-dependencies
import { composeWithDevTools }          from 'redux-devtools-extension';

import rootReducer from '../reducers';
import rootSage    from '../sagas';

export default (initialState = {}) => {
	const sagaMiddleware    = createSagaMiddleware();
	const composedEnhancers = composeWithDevTools(applyMiddleware(sagaMiddleware));
	const store = createStore(rootReducer, initialState, composedEnhancers);
	sagaMiddleware.run(rootSage);
	return store;
};
