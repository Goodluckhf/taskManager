import {
	select, put,
	takeEvery, fork, call,
}               from 'redux-saga/effects';
import axios    from 'axios';
import { push } from 'connected-react-router';

import {
	LOGIN_REQUEST, NEED_LOGIN, LOGOUT,
	REGISTER_REQUEST, GET_USER_DATA_REQUEST,
	CREATE_CHAT_REQUEST, GET_USER_BALANCE_REQUEST,
	loginFailure, loginSuccess, registerFailure,
	needLogin, getUserDataFailure, getUserDataSuccess,
	getUserDataRequest, createChatSuccess, createChatFailure,
	getUserBalanceRequest, getUserBalanceSuccess,
} from '../actions/auth';
import { callApi } from './api';

const localstorageJwtKey = 'tasks_jwt';

export const getDefaultRoute = function* () {
	const route = yield select(state => state.router.location.pathname);
	if (route === '/login' || route === '/register') {
		return '/groups';
	}
	
	return route;
};

export const updateBalance = function* () {
	const balance = yield select(state => state.auth.get('balance'));
	if (typeof balance === 'undefined') {
		return;
	}
	
	yield put(getUserBalanceRequest());
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

export const getUserData = function* () {
	yield put(getUserDataRequest());
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
	
	yield takeEvery(CREATE_CHAT_REQUEST, function* ({ payload: data }) {
		try {
			const userData = yield callApi({
				url   : 'user/chat',
				method: 'post',
				data,
			});
			yield put(createChatSuccess(userData.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(createChatFailure(error.response.data));
				return;
			}
			
			yield put(createChatFailure(error));
		}
	});
	
	yield takeEvery(GET_USER_DATA_REQUEST, function* () {
		try {
			const userData = yield callApi({ url: 'user' });
			yield put(getUserDataSuccess(userData.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(getUserDataFailure(error.response.data));
				return;
			}
			
			yield put(getUserDataFailure(error));
		}
	});
	
	yield takeEvery(GET_USER_BALANCE_REQUEST, function* () {
		try {
			const { data: { balance } } = yield callApi({ url: 'user' });
			yield put(getUserBalanceSuccess(balance));
		} catch (error) {
			console.error(error);
		}
	});
	
	yield takeEvery(LOGOUT, function* () {
		window.localStorage.removeItem(localstorageJwtKey);
		yield put(push('/login'));
	});
}
