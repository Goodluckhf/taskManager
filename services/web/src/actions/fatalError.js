export const FATAL_ERROR = 'ERROR__FATAL_ERROR';
export const fatalError  = error => ({
	type   : FATAL_ERROR,
	payload: error,
});
