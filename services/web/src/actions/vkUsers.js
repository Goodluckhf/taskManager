// Создание задачи - приходит от саги
export const CREATE_SUCCESS = 'VK_USERS__CREATE_ADD_TASK_SUCCESS';
export const createSuccess = task => ({
	type: CREATE_SUCCESS,
	payload: { task },
});

export const CREATE_FAILURE = 'VK_USERS__CREATE_ADD_TASK_FAILURE';
export const createFailure = error => ({
	type: CREATE_FAILURE,
	payload: { error },
});

// Для редьюсера
export const CREATE_REQUEST = 'VK_USERS__CREATE_ADD_TASK_REQUEST';
export const createRequest = data => ({
	type: CREATE_REQUEST,
	payload: data,
});

export const CREATE_CHECK_ALL_USERS_SUCCESS = 'VK_USERS__CREATE_CHECK_ALL_USERS_SUCCESS';
export const createCheckAllUsersSuccess = task => ({
	type: CREATE_CHECK_ALL_USERS_SUCCESS,
	payload: { task },
});

export const CREATE_CHECK_ALL_USERS_FAILURE = 'VK_USERS__CREATE_CHECK_ALL_USERS_FAILURE';
export const createCheckAllUsersFailure = error => ({
	type: CREATE_CHECK_ALL_USERS_FAILURE,
	payload: { error },
});

// Для редьюсера
export const CREATE_CHECK_ALL_USERS_REQUEST = 'VK_USERS__CREATE_CHECK_ALL_USERS_REQUEST';
export const createCheckAllUsersRequest = data => ({
	type: CREATE_CHECK_ALL_USERS_REQUEST,
	payload: data,
});

export const REMOVE_REQUEST = 'VK_USERS__REMOVE_REQUEST';
export const removeRequest = id => ({
	type: REMOVE_REQUEST,
	payload: { id },
});

export const REMOVE_SUCCESS = 'VK_USERS__REMOVE_SUCCESS';
export const removeSuccess = id => ({
	type: REMOVE_SUCCESS,
	payload: { id },
});

export const REMOVE_FAILURE = 'VK_USERS__REMOVE_FAILURE';
export const removeFailure = (error, id) => ({
	type: REMOVE_FAILURE,
	payload: { error, id },
});

export const RESUME_REQUEST = 'VK_USERS__RESUME_REQUEST';
export const resumeRequest = id => ({
	type: RESUME_REQUEST,
	payload: { id },
});

export const RESUME_SUCCESS = 'VK_USERS__RESUME_SUCCESS';
export const resumeSuccess = id => ({
	type: RESUME_SUCCESS,
	payload: { id },
});

export const RESUME_FAILURE = 'VK_USERS__RESUME_FAILURE';
export const resumeFailure = (error, id) => ({
	type: RESUME_FAILURE,
	payload: { error, id },
});

export const LIST_REQUEST = 'VK_USERS__LIST_REQUEST';
export const listRequest = () => ({
	type: LIST_REQUEST,
	payload: {},
});

export const ACTIVE_USERS_REQUEST = 'VK_USERS__ACTIVE_USERS_REQUEST';
export const activeUsersRequest = () => ({
	type: ACTIVE_USERS_REQUEST,
	payload: {},
});

export const ACTIVE_USERS_SUCCESS = 'VK_USERS__ACTIVE_USERS_SUCCESS';
export const activeUsersSuccess = count => ({
	type: ACTIVE_USERS_SUCCESS,
	payload: { count },
});

export const LIST_SUCCESS = 'VK_USERS__LIST_SUCCESS';
export const listSuccess = tasks => ({
	type: LIST_SUCCESS,
	payload: { tasks },
});
