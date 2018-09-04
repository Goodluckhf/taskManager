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
