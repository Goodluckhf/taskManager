import { List, Map } from 'immutable';

export const routes = Map({
	items: List([
		Map({
			name : 'Паблики',
			url  : '/groups',
			icon : 'icon-speedometer',
			badge: Map({
				variant: 'info',
				text   : 'NEW',
			}),
		}),
	]),
});

export const groups = List([]);

export default {
	routes,
	groups,
};

