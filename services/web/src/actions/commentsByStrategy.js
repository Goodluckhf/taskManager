// Создание задачи - приходит от саги
export const CREATE_SUCCESS = 'COMMENTS_BY_STRATEGY__CREATE_SUCCESS';
export const createSuccess = task => ({
	type: CREATE_SUCCESS,
	payload: { task },
});

export const CREATE_FAILURE = 'COMMENTS_BY_STRATEGY__CREATE_FAILURE';
export const createFailure = error => ({
	type: CREATE_FAILURE,
	payload: { error },
});

// Для редьюсера
export const CREATE_REQUEST = 'COMMENTS_BY_STRATEGY__CREATE_REQUEST';
export const createRequest = data => ({
	type: CREATE_REQUEST,
	payload: data,
});

export const REMOVE_REQUEST = 'COMMENTS_BY_STRATEGY__REMOVE_REQUEST';
export const removeRequest = id => ({
	type: REMOVE_REQUEST,
	payload: { id },
});

export const REMOVE_SUCCESS = 'COMMENTS_BY_STRATEGY__REMOVE_SUCCESS';
export const removeSuccess = id => ({
	type: REMOVE_SUCCESS,
	payload: { id },
});

export const REMOVE_FAILURE = 'COMMENTS_BY_STRATEGY__REMOVE_FAILURE';
export const removeFailure = (error, id) => ({
	type: REMOVE_FAILURE,
	payload: { error, id },
});

export const RESUME_REQUEST = 'COMMENTS_BY_STRATEGY__RESUME_REQUEST';
export const resumeRequest = id => ({
	type: RESUME_REQUEST,
	payload: { id },
});

export const RESUME_SUCCESS = 'COMMENTS_BY_STRATEGY__RESUME_SUCCESS';
export const resumeSuccess = id => ({
	type: RESUME_SUCCESS,
	payload: { id },
});

export const RESUME_FAILURE = 'COMMENTS_BY_STRATEGY__RESUME_FAILURE';
export const resumeFailure = (error, id) => ({
	type: RESUME_FAILURE,
	payload: { error, id },
});

export const LIST_REQUEST = 'COMMENTS_BY_STRATEGY__LIST_REQUEST';
export const listRequest = () => ({
	type: LIST_REQUEST,
	payload: {},
});

export const LIST_SUCCESS = 'COMMENTS_BY_STRATEGY__LIST_SUCCESS';
export const listSuccess = tasks => ({
	type: LIST_SUCCESS,
	payload: { tasks },
});
