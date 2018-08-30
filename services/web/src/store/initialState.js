import { fromJS } from 'immutable';

export const routes = fromJS({
	items: [
		{
			name : 'Группы',
			url  : '/groups',
			icon : 'icon-speedometer',
			badge: {
				variant: 'info',
				text   : 'NEW',
			},
		},
	],
});

export default fromJS({
	routes,
});

