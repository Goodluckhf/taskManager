import { select, put, takeEvery, fork } from 'redux-saga/effects';
import { push }                  from 'connected-react-router';
import { NEED_LOGIN, needLogin } from '../actions/auth';

export const checkLogin = function* () {
	const jwt        = yield select(state => state.auth.get('jwt'));
	let currentRoute = yield select(state => state.router.location.pathname);
	
	if (currentRoute === '/login') {
		currentRoute = '/groups';
	}
	
	if (!jwt) {
		yield put(needLogin(currentRoute));
	}
};

export default function* () {
	yield fork(checkLogin);
	
	yield takeEvery(NEED_LOGIN, function* () {
		const currentRoute = yield select(state => state.router.location.pathname);
		if (currentRoute === '/login') {
			return;
		}
		
		yield put(push('/login'));
	});
}

