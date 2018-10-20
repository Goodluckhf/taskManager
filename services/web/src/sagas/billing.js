import { takeEvery, put, call }                                    from 'redux-saga/effects';
import { CONVERT_MONEY_REQUEST, convertMoneyFailure, convertMoneySuccess } from '../actions/billing';
import { callApi }                                                         from './api';
import { fatalError }                                                      from '../actions/fatalError';

export default function* () {
	yield takeEvery(CONVERT_MONEY_REQUEST, function* ({ payload: amount }) {
		try {
			const result = yield call(callApi, {
				url   : `billing/convert/${amount}`,
				method: 'get',
			});
			if (!result.success) {
				yield put(convertMoneySuccess(result.data));
				return;
			}
			
			yield put(convertMoneyFailure(result.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(convertMoneyFailure(error.response.data));
				return;
			}
			
			yield put(fatalError(error));
		}
	});
}
