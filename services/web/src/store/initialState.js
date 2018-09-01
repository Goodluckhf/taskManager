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

export const groupPage = Map({
	list: Map({
		items  : List([]),
		loading: false,
	}),
	
	form: Map({
		loading: false,
		error  : null,
	}),
});

export default {
	routes,
	groupPage,
};

