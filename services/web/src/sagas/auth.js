import {
	select, put,
	takeEvery, fork, call,
}               from 'redux-saga/effects';
import axios    from 'axios';
import { push } from 'connected-react-router';

import {
	LOGIN_REQUEST, NEED_LOGIN,
	loginFailure, loginSuccess,
	needLogin, LOGOUT, REGISTER_REQUEST, registerFailure,
} from '../actions/auth';

const localstorageJwtKey = 'tasks_jwt';

export const getDefaultRoute = function* () {
	const route = yield select(state => state.router.location.pathname);
	if (route === '/login' || route === '/register') {
		return '/groups';
	}
	
	return route;
};

export const checkLogin = function* () {
	const jwt        = yield select(state => state.auth.get('jwt'));
	let currentRoute = yield select(state => state.router.location.pathname);
	
	if (currentRoute === '/login' || currentRoute === '/register') {
		currentRoute = '/groups';
		if (jwt) {
			yield put(push(currentRoute));
			return jwt;
		}
	}
	
	if (!jwt) {
		yield put(needLogin(currentRoute));
		return false;
	}
	
	return jwt;
};

export default function* () {
	yield fork(checkLogin);
	
	yield takeEvery(NEED_LOGIN, function* ({ payload: currentRoute }) {
		if (currentRoute === '/login' || currentRoute === '/register') {
			return;
		}
		
		yield put(push('/login'));
	});
	
	yield takeEvery(LOGIN_REQUEST, function* ({ payload: data }) {
		try {
			const { data: { data: response } } = yield call(axios.post, '/api/login', data);
			yield put(loginSuccess(response));
			const lastRoute = yield select(state => state.auth.get('lastRoute'));
			// eslint-disable-next-line no-undef
			window.localStorage.setItem(localstorageJwtKey, response.token);
			yield put(push(lastRoute));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(loginFailure(error.response.data));
				return;
			}
			
			yield put(loginFailure(error));
		}
	});
	
	yield takeEvery(REGISTER_REQUEST, function* ({ payload: data }) {
		try {
			const { data: { data: response } } = yield call(axios.post, '/api/register', data);
			yield put(loginSuccess(response));
			const route = yield getDefaultRoute();
			window.localStorage.setItem(localstorageJwtKey, response.token);
			yield put(push(route));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(registerFailure(error.response.data));
				return;
			}
			
			yield put(registerFailure(error));
		}
	});
	
	yield takeEvery(LOGOUT, function* () {
		window.localStorage.removeItem(localstorageJwtKey);
		yield put(push('/login'));
	});
}

