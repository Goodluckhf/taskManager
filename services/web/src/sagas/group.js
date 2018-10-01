import { takeEvery, put, call, select } from 'redux-saga/effects';

import {
	CREATE_REQUEST, LIST_REQUEST,
	CHANGE_IS_TARGET, FILTER_CHANGE_REQUEST,
	createFailure, createSuccess, listSuccess,
	listRequest,
} from '../actions/groups';

import { callApi } from './api';
import { fatalError } from '../actions/fatalError';

export const list = function* (filterState) {
	try {
		const result = yield call(callApi, {
			url : 'groups',
			data: filterState,
		});
		
		yield put(listSuccess(result.data));
	} catch (error) {
		yield put(fatalError(error));
	}
};

export default function* () {
	yield takeEvery(CREATE_REQUEST, function* ({ payload: data }) {
		try {
			const result = yield call(callApi, {
				url   : 'group',
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
	
	yield takeEvery(LIST_REQUEST, function* ({ payload: { filterState } }) {
		yield list(filterState);
	});
	
	yield takeEvery(CHANGE_IS_TARGET, function* ({ payload: { id, isTarget } }) {
		try {
			yield call(callApi, {
				url   : `group/${id}/target`,
				method: 'put',
				data  : { isTarget },
			});
		} catch (error) {
			yield put(fatalError(error));
		}
	});
	
	yield takeEvery(FILTER_CHANGE_REQUEST, function* ({ payload: { filterState } }) {
		yield list(filterState);
	});
}

export const update = function* () {
	const filter = yield select(state => (
		state.groupPage.getIn(['list', 'filter'])
	));
	
	yield put(listRequest(filter.toJS()));
};
