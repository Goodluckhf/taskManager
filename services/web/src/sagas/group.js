import { takeEvery, put, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import axios from 'axios';

import { REQUEST_CREATE, createFailed, create } from '../actions/groups';

export default function* () {
	yield takeEvery(REQUEST_CREATE, function* ({ payload: { link } }) {
		try {
			yield call(delay, 4000);
			const { data: result } = yield call(axios.post, '/api/group', { link });
			if (!result.success) {
				yield put(createFailed(result.data));
				return;
			}
			
			yield put(create(result.data));
		} catch (error) {
			console.log(error);
			yield put(createFailed(error));
		}
	});
}
