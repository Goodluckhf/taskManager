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

// Вытаскиваем из jwt данные
const _auth = {
	jwt      : null,
	email    : '',
	chatId   : null,
	vkLink   : '',
	lastRoute: '',
};

try {
	//eslint-disable-next-line no-undef
	const jwt = window.localStorage.getItem('tasks_jwt');
	//eslint-disable-next-line no-undef
	const payload = JSON.parse(atob(jwt.split('.')[1]));
	_auth.email = payload.email;
	_auth.jwt   = jwt;
} catch (error) { console.warn(error); }

export const auth = Map(_auth);

export default {
	routes,
	groupPage,
	autoLikesPage,
	fatalError,
	wallSeekPage,
	auth,
};

