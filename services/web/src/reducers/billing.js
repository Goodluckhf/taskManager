import { Map } from 'immutable';

import { billingPage }           from '../store/initialState';
import { CONVERT_MONEY_SUCCESS } from '../actions/billing';

export default (billingState = billingPage, { type, payload }) => {
	if (type === CONVERT_MONEY_SUCCESS) {
		return billingState
			.updateIn(
				['convert'],
				() => Map(payload),
			);
	}
	
	return billingState;
};
