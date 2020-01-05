import { List, Map } from 'immutable';

export const routes = Map({
	items: List([
		// Map({
		// 	name: 'Паблики',
		// 	url: '/groups',
		// 	icon: 'icon-speedometer',
		// 	badge: Map({
		// 		variant: 'info',
		// 		text: 'NEW',
		// 	}),
		// }),
		// Map({
		// 	name: 'Автонакрутка',
		// 	url: '/autolikes',
		// 	icon: 'icon-heart',
		// 	badge: Map({
		// 		variant: 'info',
		// 		text: 'NEW',
		// 	}),
		// }),
		// Map({
		// 	name: 'Слежка',
		// 	url: '/wallseek',
		// 	icon: 'fa fa-user-secret',
		// }),
		Map({
			name: 'Комменты',
			url: '/comments-by-strategy',
			icon: 'fa fa-comments',
		}),
		Map({
			name: 'Пользователи vk.com',
			url: '/vk-users',
			icon: 'fa fa-vk',
		}),
	]),
});

export const groupPage = Map({
	list: Map({
		items: List([]),
		filter: Map({
			search: '',
			isTarget: true,
		}),
	}),

	form: Map({}),
});

export const autoLikesPage = Map({
	list: Map({
		items: List([]),
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

export const commentsByStrategyPage = Map({
	list: Map({
		items: List([]),
	}),

	form: Map({}),
});

export const vkUsersPage = Map({
	list: Map({
		items: List([]),
	}),

	form: Map({}),
});

export const billingPage = Map({
	list: Map({
		items: List([]),
		filter: 'all',
	}),

	comment: '',

	convert: Map({
		money: 0,
		rate: 0,
	}),

	form: Map({}),
});

export const fatalError = Map({});

// Вытаскиваем из jwt данные
const _auth = {
	jwt: null,
	email: '',
	chatId: null,
	vkLink: '',
	systemVkLink: '',
	lastRoute: '',
	balance: null,
	activeUsersCount: 0,
	externalLinks: [],
};

try {
	//eslint-disable-next-line no-undef
	const jwt = window.localStorage.getItem('tasks_jwt');
	//eslint-disable-next-line no-undef
	const payload = JSON.parse(atob(jwt.split('.')[1]));
	_auth.email = payload.email;
	_auth.jwt = jwt;
} catch (error) {
	console.warn(error);
}

export const auth = Map(_auth);

export default {
	routes,
	groupPage,
	autoLikesPage,
	fatalError,
	wallSeekPage,
	auth,
	billingPage,
	commentsByStrategyPage,
	vkUsersPage,
};
