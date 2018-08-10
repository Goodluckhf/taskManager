/**
 * @param {Array<T>} array
 * @returns {{T:T}}
 * @example ['val1', 'val2'] => {val1: 'val1', val2: 'val2'}
 */
// eslint-disable-next-line import/prefer-default-export, arrow-parens
export const arrayToHash = (array) => {
	return array.reduce((object, item) => {
		return {
			...object,
			[item]: item,
		};
	}, {});
};
