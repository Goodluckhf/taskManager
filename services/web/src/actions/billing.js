export const CONVERT_MONEY_REQUEST = 'BILLING__CONVERT_MONEY_REQUEST';
export const convertMoneyRequest  = amount => ({
	type   : CONVERT_MONEY_REQUEST,
	payload: amount,
});

export const CONVERT_MONEY_SUCCESS = 'BILLING__CONVERT_MONEY_SUCCESS';
export const convertMoneySuccess = task => ({
	type   : CONVERT_MONEY_SUCCESS,
	payload: { task },
});

export const CONVERT_MONEY_FAILURE = 'BILLING__CONVERT_MONEY_FAILURE';
export const convertMoneyFailure = task => ({
	type   : CONVERT_MONEY_FAILURE,
	payload: { task },
});
