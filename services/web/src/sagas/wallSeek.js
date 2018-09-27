import axios from 'axios';

import { takeEvery, put, call } from 'redux-saga/effects';
import {
	CREATE_REQUEST, LIST_REQUEST, REMOVE_REQUEST,
	createSuccess, createFailure,
	listSuccess, removeSuccess, removeFailure, RESUME_REQUEST, resumeSuccess, resumeFailure,
} from '../actions/wallSeek';
import { fatalError } from '../actions/fatalError';

export default function* () {
	yield takeEvery(CREATE_REQUEST, function* ({ payload: data }) {
		try {
			const { data: result } = yield call(axios.post, '/api/wallseek', data);
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
			const { data: result } = yield call(axios.get, '/api/wallseek');
			if (!result.success) {
				yield put(fatalError(result.data));
				return;
			}
			
			yield put(listSuccess(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	
	yield takeEvery(REMOVE_REQUEST, function* ({ payload: { id } }) {
		try {
			yield call(axios.delete, `/api/task/${id}`);
			yield put(removeSuccess(id));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(removeFailure(error.response.data, id));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(RESUME_REQUEST, function* ({ payload: { id } }) {
		try {
			yield call(axios.put, `/api/wallSeek/${id}/resume`);
			yield put(resumeSuccess(id));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(resumeFailure(error.response.data, id));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
}
