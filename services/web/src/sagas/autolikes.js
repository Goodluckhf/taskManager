import { takeEvery, put, call, select }                 from 'redux-saga/effects';
import {
	CREATE_REQUEST, LIST_REQUEST, REMOVE_REQUEST,
	FILTER_CHANGE_REQUEST, STOP_REQUEST,
	RESUME_REQUEST,
	createSuccess, createFailure,
	stopSuccess, listSuccess, stopFailure,
	removeSuccess, removeFailure, listRequest,
	resumeFailure, resumeSuccess,
}                                                       from '../actions/autolikes';
import { fatalError }                                   from '../actions/fatalError';
import { callApi }                                      from './api';

const list = function* (filterState) {
	try {
		const result = yield call(callApi, {
			url : 'autolikes',
			data: filterState,
		});
		if (!result.success) {
			yield put(fatalError(result.data));
			return;
		}
		
		yield put(listSuccess(result.data));
	} catch (error) {
		yield put(fatalError(error));
	}
};

export default function* () {
	yield takeEvery(CREATE_REQUEST, function* ({ payload: data }) {
		try {
			const result = yield call(callApi, {
				url   : 'autolikes',
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
	
	yield takeEvery(LIST_REQUEST, function* ({ payload: filterState }) {
		yield list(filterState);
	});
	
	yield takeEvery(FILTER_CHANGE_REQUEST, function* ({ payload: { filterState } }) {
		yield list(filterState);
	});
	
	yield takeEvery(STOP_REQUEST, function* ({ payload: { id } }) {
		try {
			yield call(callApi, {
				url   : `task/stop/${id}`,
				method: 'post',
			});
			yield put(stopSuccess(id));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(stopFailure(error.response.data, id));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(REMOVE_REQUEST, function* ({ payload: { id } }) {
		try {
			yield call(callApi, {
				url   : `task/${id}`,
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
	
	yield takeEvery(RESUME_REQUEST, function* ({ payload: { id } }) {
		try {
			yield call(callApi, {
				url   : `autolikes/${id}/resume`,
				method: 'put',
			});
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

export const update = function* () {
	const filter = yield select(state => (
		state.autoLikesPage.getIn(['list', 'filter'])
	));
	
	yield put(listRequest({ filter }));
};
