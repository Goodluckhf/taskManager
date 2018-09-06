export const REQUEST_CREATE = 'AUTO_LIKES__REQUEST_CREATE_AUTO_LIKES';
export const requestCreate  = data => ({
	type   : REQUEST_CREATE,
	payload: data,
});

export const CREATE = 'AUTO_LIKES__CREATE_AUTO_LIKES';
export const create = task => ({
	type   : CREATE,
	payload: { task },
});

export const CREATE_FAILED = 'AUTO_LIKES__CREATE_AUTO_LIKES_FAILED';
export const createFailed = error => ({
	type   : CREATE_FAILED,
	payload: { error },
});


export const REQUEST_LIST = 'AUTO_LIKES__LIST_REQUEST';
export const requestList  = () => ({
	type   : REQUEST_LIST,
	payload: {},
});

export const REQUEST_FILTER_CHANGE = 'AUTO_LIKES__FILTER_CHANGE';
export const requestFilterChange   = filterState => ({
	type   : REQUEST_FILTER_CHANGE,
	payload: { filterState },
});

export const LIST = 'AUTO_LIKES__LIST_SUCCESS';
export const list = tasks => ({
	type   : LIST,
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
