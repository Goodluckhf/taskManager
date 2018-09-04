import axios from 'axios';

import { takeEvery, put, call }                 from 'redux-saga/effects';
import { REQUEST_CREATE, create, createFailed } from '../actions/autolikes';
import { fatalError }                           from '../actions/fatalError';

export default function* () {
	yield takeEvery(REQUEST_CREATE, function* ({ payload: data }) {
		try {
			const { data: result } = yield call(axios.post, '/api/task', data);
			yield put(create(result));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(createFailed(error.response.data));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
}
