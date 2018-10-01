export const NEED_LOGIN = 'AUTH__NEED_LOGIN';
export const needLogin  = lastRoute => ({
	type   : NEED_LOGIN,
	payload: { lastRoute },
});

export const LOGIN_REQUEST = 'AUTH__LOGIN_REQUEST';
export const loginRequest  = credentials => ({
	type   : LOGIN_REQUEST,
	payload: credentials,
});

export const LOGIN_FAILURE = 'AUTH__LOGIN_FAILURE';
export const loginFailure = error => ({
	type   : LOGIN_FAILURE,
	payload: { error },
});

export const LOGIN_SUCCESS = 'AUTH__LOGIN_SUCCESS';
export const loginSuccess = data => ({
	type   : LOGIN_SUCCESS,
	payload: data,
});
