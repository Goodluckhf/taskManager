import { takeEvery, put, call } from 'redux-saga/effects';

import axios from 'axios';

import {
	REQUEST_CREATE, REQUEST_LIST,
	createFailed, create, list, CHANGE_IS_TARGET,
} from '../actions/groups';

import { fatalError } from '../actions/fatalError';

export default function* () {
	yield takeEvery(REQUEST_CREATE, function* ({ payload: data }) {
		try {
			const { data: result } = yield call(axios.post, '/api/group', data);
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
			const { data: result } = yield call(axios.get, '/api/groups');
			yield put(list(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(CHANGE_IS_TARGET, function* ({ payload: { id, isTarget } }) {
		try {
			yield call(axios.put, `/api/group/${id}/target`, { isTarget });
		} catch (error) {
			yield put(fatalError(error));
		}
	});
}
