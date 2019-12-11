import { takeEvery, put, call } from 'redux-saga/effects';
import {
	CREATE_REQUEST,
	LIST_REQUEST,
	REMOVE_REQUEST,
	createSuccess,
	createFailure,
	listRequest,
	listSuccess,
	removeSuccess,
	removeFailure,
} from '../actions/commentsByStrategy';
import { fatalError } from '../actions/fatalError';
import { callApi } from './api';

export default function*() {
	yield takeEvery(CREATE_REQUEST, function*({ payload: data }) {
		try {
			const result = yield call(callApi, {
				url: 'comments-by-strategy',
				method: 'post',
				data,
			});
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

	yield takeEvery(LIST_REQUEST, function*() {
		try {
			const result = yield call(callApi, { url: 'comments-by-strategy' });
			if (!result.success) {
				yield put(fatalError(result.data));
				return;
			}

			yield put(listSuccess(result.data));
		} catch (error) {
			yield put(fatalError(error));
		}
	});

	yield takeEvery(REMOVE_REQUEST, function*({ payload: { id } }) {
		try {
			yield call(callApi, {
				url: `task/${id}`,
				method: 'delete',
			});
			yield put(removeSuccess(id));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(removeFailure(error.response.data, id));
				return;
			}

			yield put(fatalError(error));
		}
	});
}

export const update = function*() {
	yield put(listRequest());
};
