import { List, Map } from 'immutable';

export const loaderReducer = (state = {}, action) => {
	const { type, payload: { id } = {} } = action;
	const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);
	if (!matches) {
		return state;
	}
	
	const [, requestName, requestState] = matches;
	const value = requestState === 'REQUEST';
	const result =
		id ?
			{ [id]: value } :
			{ default: value };
	
	return {
		...state,
		[requestName]: { ...state[requestName], ...result },
	};
};

export const errorReducer = (_state = {}, action) => {
	const { type, payload: { id, error } = {} } = action;
	const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);
	if (!matches) {
		return _state;
	}
	
	// Обновляем, что бы удалить все предыдущие ошибки
	const state = {};
	const [, requestName, requestState] = matches;
	const value  = requestState === 'FAILURE' ? error : null;
	const result =
		id ?
			{ [id]: value } :
			{ default: value };
	
	return {
		...state,
		[requestName]: { ...state[requestName], ...result },
	};
};

const loading = (item, key, action, list) => {
	if (typeof action === 'undefined') {
		return item.set(key, false);
	}
	
	const value = list ?
		action[item.get('_id')] || item.get(key) || false
		: action.default || item.get(key) || false;
	
	if (value === item.get(key)) {
		return item;
	}
	
	return item.set(key, value);
};

const error = (item, action, list) => {
	const lastError = item.get('error');
	if (typeof action === 'undefined') {
		return item.set('error', lastError || null);
	}
	
	const value = list ?
		action[item.get('_id')] || lastError || null
		: action.default || lastError || null;
	
	if (value === lastError) {
		return item;
	}
	
	return item.set('error', value);
};

/**
 * Селектор автоматически подставляет поле loading
 * @param {Object.<String, String>} actionMap
 * @param {String} statePath
 * @param {Object} _state
 * @param {Array.<String>} path
 * @return {*}
 */
export const loaderSelector = (actionMap, statePath, _state, path) => {
	let state = _state[statePath].getIn(path);
	if (state instanceof List) {
		return state.map((_item) => {
			let item = _item;
			Object.entries(actionMap).forEach(([action, key]) => {
				const loaderAction = _state.loader[action];
				const errorAction  = _state.error[action];
				
				item = loading(item, key, loaderAction, true);
				item = error(item, errorAction, true);
			});
			
			return item;
		});
	}
	
	if (state instanceof Map) {
		Object.entries(actionMap).forEach(([action, key]) => {
			const loaderAction = _state.loader[action];
			const errorAction  = _state.error[action];
			state = loading(state, key, loaderAction, false);
			state = error(state, errorAction, false);
		});
		
		return state;
	}
	
	return state;
};

/**
 * @param {String} action
 * @param {Object} state
 * @return {*}
 */
export const getLoaderState = (action, state) => {
	const loaderState = state.loader[action];
	if (!loaderState) {
		return false;
	}
	
	return loaderState.default;
};
