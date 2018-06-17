// @flow

export type ArrayToHashT<T> = {
	[T]: T
};

/**
 * @param array
 * @returns {*}
 * @example ['val1', 'val2'] => {val1: 'val1', val2: 'val2'}
 */
// eslint-disable-next-line import/prefer-default-export, arrow-parens
export const arrayToHash = <T> (array: Array<T>): ArrayToHashT<T> => {
	return array.reduce((object: ArrayToHashT<T>, item: T) => {
		return {
			...object,
			[item]: item,
		};
	}, {});
};
