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
export const requestCreate  = link => ({
	type   : REQUEST_CREATE,
	payload: { link },
});
