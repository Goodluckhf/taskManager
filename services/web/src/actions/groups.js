// Создание группы - приходит от саги
export const CREATE_SUCCESS = 'GROUPS__CREATE_SUCCESS';
export const createSuccess = group => ({
	type   : CREATE_SUCCESS,
	payload: { group },
});

export const CREATE_FAILURE = 'GROUPS__CREATE_FAILURE';
export const createFailure  = error => ({
	type   : CREATE_FAILURE,
	payload: { error },
});


// Для редьюсера
export const CREATE_REQUEST = 'GROUPS__CREATE_REQUEST';
export const createRequest  = data => ({
	type   : CREATE_REQUEST,
	payload: data,
});


export const LIST_REQUEST = 'GROUPS__LIST_REQUEST';
export const listRequest  = () => ({
	type   : LIST_REQUEST,
	payload: {},
});

export const LIST_SUCCESS = 'GROUPS__LIST_SUCCESS';
export const listSuccess = groups => ({
	type   : LIST_SUCCESS,
	payload: { groups },
});

export const LIST_FAILURE = 'GROUPS__LIST_FAILURE';
export const listFailure = error => ({
	type   : LIST_FAILURE,
	payload: { error },
});

export const CHANGE_IS_TARGET = 'GROUP__CHANGE_IS_TARGET';
export const changeIsTarget = (id, isTarget) => ({
	type   : CHANGE_IS_TARGET,
	payload: { id, isTarget },
});

export const REQUEST_FILTER_CHANGE = 'GROUP__FILTER_CHANGE';
export const requestFilterChange   = filterState => ({
	type   : REQUEST_FILTER_CHANGE,
	payload: { filterState },
});
