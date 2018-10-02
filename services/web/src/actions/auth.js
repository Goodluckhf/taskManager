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

export const REGISTER_REQUEST = 'AUTH__REGISTER_REQUEST';
export const registerRequest  = credentials => ({
	type   : REGISTER_REQUEST,
	payload: credentials,
});

export const REGISTER_FAILURE = 'AUTH__REGISTER_FAILURE';
export const registerFailure = error => ({
	type   : REGISTER_FAILURE,
	payload: { error },
});

export const REGISTER_SUCCESS = 'AUTH__REGISTER_SUCCESS';
export const registerSuccess = data => ({
	type   : REGISTER_SUCCESS,
	payload: data,
});


export const LOGOUT = 'AUTH__LOGOUT';
export const logout = () => ({
	type   : LOGOUT,
	payload: {},
});
