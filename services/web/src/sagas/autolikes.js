import axios from 'axios';

import { takeEvery, put, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import {
	CREATE_REQUEST, LIST_REQUEST,
	FILTER_CHANGE_REQUEST, STOP_REQUEST,
	createSuccess, createFailure,
	stopSuccess, listSuccess,
} from '../actions/autolikes';
import { fatalError }           from '../actions/fatalError';

export default function* () {
	yield takeEvery(CREATE_REQUEST, function* ({ payload: data }) {
		try {
			const { data: result } = yield call(axios.post, '/api/task', data);
			if (!result.success) {
				yield put(createFailure(result.data));
				return;
			}
			
			yield put(createSuccess(result.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(createFailure(error.response.data));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(LIST_REQUEST, function* () {
		try {
			const { data: result } = yield call(axios.get, '/api/tasks');
			if (!result.success) {
				yield put(fatalError(result.data));
				return;
			}
			
			yield put(listSuccess(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(FILTER_CHANGE_REQUEST, function* ({ payload: { filterState } }) {
		try {
			const { data: result } = yield call(axios.get, '/api/tasks', { params: filterState });
			if (!result.success) {
				yield put(fatalError(result.data));
				return;
			}
			
			yield put(listSuccess(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	yield  takeEvery(STOP_REQUEST, function* ({ payload: { id } }) {
		yield call(delay, 3000);
		
		yield put(stopSuccess(id));
	});
}
