import { call, put, select } from 'redux-saga/effects';
import axios from 'axios';
import { checkLogin } from './auth';
import { needLogin, logout } from '../actions/auth';

const baseUrl = '/api';
/**
 * @param {String} url
 * @param {Object} data
 * @param {String} [method = 'get]
 * @return {IterableIterator<*>}
 */
//eslint-disable-next-line import/prefer-default-export,consistent-return
export const callApi = function*({ url, data: _data = {}, method = 'get' }) {
	try {
		const jwt = yield call(checkLogin);
		if (!jwt) {
			throw new Error('no auth');
		}

		const params = {
			..._data,
			jwt,
		};
		const data = ['get', 'delete'].includes(method) ? { params } : { data: params };

		const requestConfig = {
			method,
			url: `${baseUrl}/${url}`,
			headers: { Authorization: jwt },
			...data,
		};
		const { data: result } = yield call(axios, requestConfig);
		return result;
	} catch (error) {
		//eslint-disable-next-line no-mixed-operators
		if (error.message === 'no auth' || (error.response && error.response.status === 401)) {
			const currentRoute = yield select(state => state.router.location.pathname);
			yield put(logout());
			yield put(needLogin(currentRoute));
			throw error;
		}

		throw error;
	}
};
