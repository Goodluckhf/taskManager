import { call, put, select }       from 'redux-saga/effects';
import axios          from 'axios';
import { checkLogin } from './auth';
import { needLogin }  from '../actions/auth';

const baseUrl = '/api';
/**
 * @param {String} url
 * @param {Object} data
 * @param {String} [method = 'get]
 * @return {IterableIterator<*>}
 */
//eslint-disable-next-line import/prefer-default-export,consistent-return
export const callApi = function* ({ url, data: _data = {}, method = 'get' }) {
	try {
		const jwt = yield call(checkLogin);
		if (!jwt) {
			throw new Error('no auth');
		}
		
		const params = {
			..._data,
			jwt,
		};
		const data = method === 'get' ? { params } : params;
		
		const { data: result } = yield call(axios[method], `${baseUrl}/${url}`, data);
		return result;
	} catch (error) {
		if (error.message !== 'no auth' || !error.response || error.response.status !== 401) {
			throw error;
		}
		
		const currentRoute = yield select(state => state.router.location.pathname);
		yield put(needLogin(currentRoute));
	}
};
