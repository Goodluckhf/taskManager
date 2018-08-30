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

export default Map({
	routes,
});

