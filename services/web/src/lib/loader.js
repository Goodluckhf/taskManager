import { List } from 'immutable';

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

//@TODO: Отрефакторить
//@TODO: Добавить для Map
export const loaderSelector = (actions, _path, _state, path) => {
	const state = _state[_path].getIn(path);
	if (state instanceof List) {
		return state.map((_item) => {
			let item = _item;
			actions.forEach((action) => {
				const loaderAction = _state.loader[action];
				if (!loaderAction) {
					return;
				}
				
				const key   = `${action}_loader`;
				const value = loaderAction[item.get('_id')] || item.get(key) || false;
				if (value === item.get(key)) {
					return;
				}
				
				item = item.set(key, value);
			});
			
			return item;
		});
	}
	
	return state;
};
