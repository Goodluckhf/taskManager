import axios from 'axios';

import { takeEvery, put, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import {
	REQUEST_CREATE, REQUEST_LIST,
	create, createFailed, list, REQUEST_FILTER_CHANGE, STOP_REQUEST, stopSuccess,
} from '../actions/autolikes';
import { fatalError }           from '../actions/fatalError';

export default function* () {
	yield takeEvery(REQUEST_CREATE, function* ({ payload: data }) {
		try {
			const { data: result } = yield call(axios.post, '/api/task', data);
			if (!result.success) {
				yield put(createFailed(result.data));
				return;
			}
			
			yield put(create(result.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(createFailed(error.response.data));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(REQUEST_LIST, function* () {
		try {
			const { data: result } = yield call(axios.get, '/api/tasks');
			if (!result.success) {
				yield put(fatalError(result.data));
				return;
			}
			
			yield put(list(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(REQUEST_FILTER_CHANGE, function* ({ payload: { filterState } }) {
		try {
			const { data: result } = yield call(axios.get, '/api/tasks', { params: filterState });
			if (!result.success) {
				yield put(fatalError(result.data));
				return;
			}
			
			yield put(list(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	yield  takeEvery(STOP_REQUEST, function* ({ payload: { id } }) {
		yield call(delay, 3000);
		
		yield put(stopSuccess(id));
	});
}
