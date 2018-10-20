import { Map } from 'immutable';

import { billingPage }                                         from '../store/initialState';
import { CONVERT_MONEY_SUCCESS, CREATE_TOPUP_INVOICE_SUCCESS } from '../actions/billing';

export default (billingState = billingPage, { type, payload }) => {
	if (type === CONVERT_MONEY_SUCCESS) {
		return billingState
			.updateIn(
				['convert'],
				() => Map(payload),
			);
	}
	
	if (type === CREATE_TOPUP_INVOICE_SUCCESS) {
		return billingState
			.updateIn(
				['comment'],
				() => payload.note,
			);
	}
	
	
	return billingState;
};
