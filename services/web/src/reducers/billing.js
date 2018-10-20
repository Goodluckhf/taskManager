import { billingPage }           from '../store/initialState';
import { CONVERT_MONEY_SUCCESS } from '../actions/billing';

export default (billingState = billingPage, { type, payload }) => {
	if (type === CONVERT_MONEY_SUCCESS) {
		console.log(payload);
		return billingState
			.updateIn(
				['form', 'money'],
				() => payload,
			);
	}
	
	return billingState;
};
