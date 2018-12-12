import { takeEvery, put, call, select } from 'redux-saga/effects';
import {
	CHECK_PAYMENT_REQUEST,
	LIST_REQUEST,
	FILTER_CHANGE_REQUEST,
	CONVERT_MONEY_REQUEST,
	CREATE_TOPUP_INVOICE_REQUEST,
	convertMoneyFailure,
	checkPaymentFailure,
	checkPaymentSuccess,
	convertMoneySuccess,
	createTopUpInvoiceFailure,
	createTopUpInvoiceSuccess,
	listSuccess,
	listRequest,
} from '../actions/billing';
import { callApi } from './api';
import { fatalError } from '../actions/fatalError';
import { getUserBalanceSuccess } from '../actions/auth';

export const list = function*(status) {
	try {
		const result = yield call(callApi, {
			url: 'billing/invoices',
			data: { status },
			method: 'get',
		});
		if (!result.success) {
			yield put(fatalError(result.data));
			return;
		}

		yield put(listSuccess(result.data));
	} catch (error) {
		if (error.response && error.response.data) {
			yield put(fatalError(error.response.data));
			return;
		}

		yield put(fatalError(error));
	}
};

export default function*() {
	yield takeEvery(CONVERT_MONEY_REQUEST, function*({ payload: amount }) {
		try {
			const result = yield call(callApi, {
				url: `billing/convert/${amount}`,
				method: 'get',
			});
			if (!result.success) {
				yield put(convertMoneyFailure(result.data));
				return;
			}

			yield put(convertMoneySuccess(result.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(convertMoneyFailure(error.response.data));
				return;
			}

			yield put(fatalError(error));
		}
	});

	yield takeEvery(CREATE_TOPUP_INVOICE_REQUEST, function*({ payload: amount }) {
		try {
			const result = yield call(callApi, {
				url: `user/balance/${amount}`,
				method: 'post',
			});
			if (!result.success) {
				yield put(createTopUpInvoiceFailure(result.data));
				return;
			}

			yield put(createTopUpInvoiceSuccess(result.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(createTopUpInvoiceFailure(error.response.data));
				return;
			}

			yield put(fatalError(error));
		}
	});

	yield takeEvery(CHECK_PAYMENT_REQUEST, function*() {
		try {
			const result = yield call(callApi, {
				url: 'user/balance/check',
				method: 'post',
			});
			if (!result.success) {
				yield put(checkPaymentFailure(result.data));
				return;
			}

			yield put(checkPaymentSuccess());
			yield put(getUserBalanceSuccess(result.data));
		} catch (error) {
			if (error.response && error.response.data) {
				yield put(checkPaymentFailure(error.response.data));
				return;
			}

			yield put(fatalError(error));
		}
	});

	yield takeEvery(LIST_REQUEST, function*({ payload: { status } }) {
		yield list(status);
	});

	yield takeEvery(FILTER_CHANGE_REQUEST, function*({ payload: { status } }) {
		yield list(status);
	});
}

export const update = function*() {
	const status = yield select(state => state.billingPage.getIn(['list', 'filter']));
	yield put(listRequest(status));
};
