import { takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';

import {
	CREATE_REQUEST, LIST_REQUEST,
	CHANGE_IS_TARGET, FILTER_CHANGE_REQUEST,
	createFailure, createSuccess, listSuccess,
} from '../actions/groups';

import { fatalError } from '../actions/fatalError';

export default function* () {
	yield takeEvery(CREATE_REQUEST, function* ({ payload: data }) {
		try {
			const { data: result } = yield call(axios.post, '/api/group', data);
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
			const { data: result } = yield call(axios.get, '/api/groups');
			yield put(listSuccess(result.data));
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
	
	yield takeEvery(FILTER_CHANGE_REQUEST, function* ({ payload: { filterState } }) {
		try {
			const { data: result } = yield call(axios.get, '/api/groups', { params: filterState });
			yield put(listSuccess(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});
}
