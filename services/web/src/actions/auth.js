export const NEED_LOGIN = 'AUTH__NEED_LOGIN';
export const needLogin  = lastRoute => ({
	type   : NEED_LOGIN,
	payload: { lastRoute },
});
