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
		Map({
			name : 'Автолайки',
			url  : '/autolikes',
			icon : 'icon-heart',
			badge: Map({
				variant: 'info',
				text   : 'NEW',
			}),
		}),
		Map({
			name: 'Слежка',
			url : '/wallseek',
			icon: 'fa fa-user-secret',
		}),
	]),
});

export const groupPage = Map({
	list: Map({
		items : List([]),
		filter: Map({
			search  : '',
			isTarget: true,
		}),
	}),
	
	form: Map({}),
});

export const autoLikesPage = Map({
	list: Map({
		items : List([]),
		filter: 'active',
	}),
	
	form: Map({}),
});

export const wallSeekPage = Map({
	list: Map({
		items: List([]),
	}),
	
	form: Map({}),
});

export const fatalError = Map({});

export default {
	routes,
	groupPage,
	autoLikesPage,
	fatalError,
	wallSeekPage,
};

