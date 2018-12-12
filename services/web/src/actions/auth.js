export const NEED_LOGIN = 'AUTH__NEED_LOGIN';
export const needLogin = lastRoute => ({
	type: NEED_LOGIN,
	payload: { lastRoute },
});

export const LOGIN_REQUEST = 'AUTH__LOGIN_REQUEST';
export const loginRequest = credentials => ({
	type: LOGIN_REQUEST,
	payload: credentials,
});

export const LOGIN_FAILURE = 'AUTH__LOGIN_FAILURE';
export const loginFailure = error => ({
	type: LOGIN_FAILURE,
	payload: { error },
});

export const LOGIN_SUCCESS = 'AUTH__LOGIN_SUCCESS';
export const loginSuccess = data => ({
	type: LOGIN_SUCCESS,
	payload: data,
});

export const REGISTER_REQUEST = 'AUTH__REGISTER_REQUEST';
export const registerRequest = credentials => ({
	type: REGISTER_REQUEST,
	payload: credentials,
});

export const REGISTER_FAILURE = 'AUTH__REGISTER_FAILURE';
export const registerFailure = error => ({
	type: REGISTER_FAILURE,
	payload: { error },
});

export const REGISTER_SUCCESS = 'AUTH__REGISTER_SUCCESS';
export const registerSuccess = data => ({
	type: REGISTER_SUCCESS,
	payload: data,
});

export const CREATE_CHAT_REQUEST = 'AUTH__CREATE_CHAT_REQUEST';
export const createChatRequest = vkLink => ({
	type: CREATE_CHAT_REQUEST,
	payload: { vkLink },
});

export const CREATE_CHAT_FAILURE = 'AUTH__CREATE_CHAT_FAILURE';
export const createChatFailure = error => ({
	type: CREATE_CHAT_FAILURE,
	payload: { error },
});

export const CREATE_CHAT_SUCCESS = 'AUTH__CREATE_CHAT_SUCCESS';
export const createChatSuccess = data => ({
	type: CREATE_CHAT_SUCCESS,
	payload: data,
});

export const GET_USER_DATA_REQUEST = 'AUTH__GET_USER_DATA_REQUEST';
export const getUserDataRequest = () => ({
	type: GET_USER_DATA_REQUEST,
	payload: {},
});

export const GET_USER_DATA_FAILURE = 'AUTH__GET_USER_DATA_FAILURE';
export const getUserDataFailure = error => ({
	type: GET_USER_DATA_FAILURE,
	payload: { error },
});

export const GET_USER_DATA_SUCCESS = 'AUTH__GET_USER_DATA_SUCCESS';
export const getUserDataSuccess = data => ({
	type: GET_USER_DATA_SUCCESS,
	payload: data,
});

export const GET_USER_BALANCE_REQUEST = 'AUTH__GET_USER_BALANCE_REQUEST';
export const getUserBalanceRequest = () => ({
	type: GET_USER_BALANCE_REQUEST,
	payload: {},
});

export const GET_USER_BALANCE_SUCCESS = 'AUTH__GET_USER_BALANCE_SUCCESS';
export const getUserBalanceSuccess = balance => ({
	type: GET_USER_BALANCE_SUCCESS,
	payload: balance,
});

export const LOGOUT = 'AUTH__LOGOUT';
export const logout = () => ({
	type: LOGOUT,
	payload: {},
});

// @TODO: Вынести в отдельный файл
export const SET_EXTERNAL_LINKS_REQUEST = 'AUTH__SET_EXTERNAL_LINKS_REQUEST';
export const setExternalLinksRequest = links => ({
	type: SET_EXTERNAL_LINKS_REQUEST,
	payload: { links },
});

export const SET_EXTERNAL_LINKS_FAILURE = 'AUTH__SET_EXTERNAL_LINKS_FAILURE';
export const setExternalLinksFailure = error => ({
	type: SET_EXTERNAL_LINKS_FAILURE,
	payload: { error },
});

export const SET_EXTERNAL_LINKS_SUCCESS = 'AUTH__SET_EXTERNAL_LINKS_SUCCESS';
export const setExternalLinksSuccess = () => ({
	type: SET_EXTERNAL_LINKS_SUCCESS,
	payload: {},
});
