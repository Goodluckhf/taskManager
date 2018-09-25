// Создание задачи - приходит от саги
export const CREATE_SUCCESS = 'WALLSEEK__CREATE_SUCCESS';
export const createSuccess = task => ({
	type   : CREATE_SUCCESS,
	payload: { task },
});

export const CREATE_FAILURE = 'WALLSEEK__CREATE_FAILURE';
export const createFailure  = error => ({
	type   : CREATE_FAILURE,
	payload: { error },
});


// Для редьюсера
export const CREATE_REQUEST = 'WALLSEEK__CREATE_REQUEST';
export const createRequest  = data => ({
	type   : CREATE_REQUEST,
	payload: data,
});


export const REMOVE_REQUEST = 'WALLSEEK__REMOVE_REQUEST';
export const removeRequest = id => ({
	type   : REMOVE_REQUEST,
	payload: { id },
});

export const REMOVE_SUCCESS = 'WALLSEEK__REMOVE_SUCCESS';
export const removeSuccess = id => ({
	type   : REMOVE_SUCCESS,
	payload: { id },
});

export const REMOVE_FAILURE = 'WALLSEEK__REMOVE_FAILURE';
export const removeFailure = (error, id) => ({
	type   : REMOVE_FAILURE,
	payload: { error, id },
});


export const LIST_REQUEST = 'WALLSEEK__LIST_REQUEST';
export const listRequest  = () => ({
	type   : LIST_REQUEST,
	payload: {},
});


export const LIST_SUCCESS = 'WALLSEEK__LIST_SUCCESS';
export const listSuccess = tasks => ({
	type   : LIST_SUCCESS,
	payload: { tasks },
});
