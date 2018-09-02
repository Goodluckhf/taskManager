// Создание группы - приходит от саги
export const CREATE = 'GROUPS__CREATE_GROUP';
export const create = group => ({
	type   : CREATE,
	payload: { group },
});

export const CREATE_FAILED = 'GROUPS__CREATE_GROUP_FAILED';
export const createFailed  = error => ({
	type   : CREATE_FAILED,
	payload: { error },
});


// Для редьюсера
export const REQUEST_CREATE = 'GROUPS__REQUEST_CREATE_GROUP';
export const requestCreate  = data => ({
	type   : REQUEST_CREATE,
	payload: data,
});


export const REQUEST_LIST = 'GROUP__REQUEST_LIST';
export const requestList  = () => ({
	type   : REQUEST_LIST,
	payload: {},
});

export const LIST = 'GROUP__LIST';
export const list = groups => ({
	type   : LIST,
	payload: { groups },
});

export const CHANGE_IS_TARGET = 'GROUP__CHANGE_IS_TARGET';
export const changeIsTarget = (id, isTarget) => ({
	type   : CHANGE_IS_TARGET,
	payload: { id, isTarget },
});

