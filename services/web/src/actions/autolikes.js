export const CREATE_REQUEST = 'AUTO_LIKES__CREATE_REQUEST';
export const createRequest  = data => ({
	type   : CREATE_REQUEST,
	payload: data,
});

export const CREATE_SUCCESS = 'AUTO_LIKES__CREATE_SUCCESS';
export const createSuccess = task => ({
	type   : CREATE_SUCCESS,
	payload: { task },
});

export const CREATE_FAILURE = 'AUTO_LIKES__CREATE_FAILURE';
export const createFailure = error => ({
	type   : CREATE_FAILURE,
	payload: { error },
});


export const LIST_REQUEST = 'AUTO_LIKES__LIST_REQUEST';
export const listRequest  = () => ({
	type   : LIST_REQUEST,
	payload: {},
});

export const FILTER_CHANGE_REQUEST = 'AUTO_LIKES__FILTER_CHANGE_REQUEST';
export const filterChangeRequest   = filterState => ({
	type   : FILTER_CHANGE_REQUEST,
	payload: { filterState },
});

export const LIST_SUCCESS = 'AUTO_LIKES__LIST_SUCCESS';
export const listSuccess = tasks => ({
	type   : LIST_SUCCESS,
	payload: { tasks },
});


export const STOP_REQUEST = 'AUTO_LIKES__STOP_REQUEST';
export const stopRequest = id => ({
	type   : STOP_REQUEST,
	payload: { id },
});

export const STOP_SUCCESS = 'AUTO_LIKES__STOP_SUCCESS';
export const stopSuccess = id => ({
	type   : STOP_SUCCESS,
	payload: { id },
});

export const STOP_FAILURE = 'AUTO_LIKES__STOP_FAILURE';
export const stopFailure = id => ({
	type   : STOP_FAILURE,
	payload: { id },
});
