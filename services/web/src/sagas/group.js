import { takeEvery, put, call } from 'redux-saga/effects';

import axios from 'axios';

import {
	REQUEST_CREATE, REQUEST_LIST,
	createFailed, create, list,
} from '../actions/groups';

export default function* () {
	yield takeEvery(REQUEST_CREATE, function* ({ payload: { link } }) {
		try {
			const { data: result } = yield call(axios.post, '/api/group', { link });
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
			
			yield put(createFailed(error));
		}
	});
	
	yield takeEvery(REQUEST_LIST, function* () {
		const { data: result } = yield call(axios.get, '/api/groups');
		//@TODO: Добавить обработку ошибки
		yield put(list(result.data));
	});
}