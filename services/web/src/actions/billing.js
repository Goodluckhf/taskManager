export const CONVERT_MONEY_REQUEST = 'BILLING__CONVERT_MONEY_REQUEST';
export const convertMoneyRequest  = amount => ({
	type   : CONVERT_MONEY_REQUEST,
	payload: amount,
});

export const CONVERT_MONEY_SUCCESS = 'BILLING__CONVERT_MONEY_SUCCESS';
export const convertMoneySuccess = convert => ({
	type   : CONVERT_MONEY_SUCCESS,
	payload: convert,
});

export const CONVERT_MONEY_FAILURE = 'BILLING__CONVERT_MONEY_FAILURE';
export const convertMoneyFailure = error => ({
	type   : CONVERT_MONEY_FAILURE,
	payload: { error },
});


export const CREATE_TOPUP_INVOICE_REQUEST = 'BILLING__CREATE_TOPUP_INVOICE_REQUEST';
export const createTopUpInvoiceRequest  = amount => ({
	type   : CREATE_TOPUP_INVOICE_REQUEST,
	payload: amount,
});

export const CREATE_TOPUP_INVOICE_SUCCESS = 'BILLING__CREATE_TOPUP_INVOICE_SUCCESS';
export const createTopUpInvoiceSuccess = convert => ({
	type   : CREATE_TOPUP_INVOICE_SUCCESS,
	payload: convert,
});

export const CREATE_TOPUP_INVOICE_FAILURE = 'BILLING__CREATE_TOPUP_INVOICE_FAILURE';
export const createTopUpInvoiceFailure = error => ({
	type   : CREATE_TOPUP_INVOICE_FAILURE,
	payload: { error },
});

