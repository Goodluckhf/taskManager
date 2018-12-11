import { Map, fromJS } from 'immutable';

import { billingPage } from '../store/initialState';
import {
	CONVERT_MONEY_SUCCESS,
	CREATE_TOPUP_INVOICE_SUCCESS,
	FILTER_CHANGE_REQUEST,
	LIST_SUCCESS,
} from '../actions/billing';

export default (billingState = billingPage, { type, payload }) => {
	if (type === CONVERT_MONEY_SUCCESS) {
		return billingState.updateIn(['convert'], () => Map(payload));
	}

	if (type === CREATE_TOPUP_INVOICE_SUCCESS) {
		return billingState.updateIn(['comment'], () => payload.note);
	}

	if (type === LIST_SUCCESS) {
		return billingState.updateIn(['list', 'items'], () => fromJS(payload));
	}

	if (type === FILTER_CHANGE_REQUEST) {
		return billingState.updateIn(['list', 'filter'], () => payload.status);
	}

	return billingState;
};
