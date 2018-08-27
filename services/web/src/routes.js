import React from 'react';
import Loadable from 'react-loadable';

import DefaultLayout from './views/layout/Layout';

function Loading() {
	return <div>Loading...</div>;
}

const Breadcrumbs = Loadable({
	loader : () => import('./views/Base/Breadcrumbs'),
	loading: Loading,
});

const Cards = Loadable({
	loader : () => import('./views/Base/Cards'),
	loading: Loading,
});

const Carousels = Loadable({
	loader : () => import('./views/Base/Carousels'),
	loading: Loading,
});

const Collapses = Loadable({
	loader : () => import('./views/Base/Collapses'),
	loading: Loading,
});

const Dropdowns = Loadable({
	loader : () => import('./views/Base/Dropdowns'),
	loading: Loading,
});

const Forms = Loadable({
	loader : () => import('./views/Base/Forms'),
	loading: Loading,
});

const Jumbotrons = Loadable({
	loader : () => import('./views/Base/Jumbotrons'),
	loading: Loading,
});

const ListGroups = Loadable({
	loader : () => import('./views/Base/ListGroups'),
	loading: Loading,
});

const Navbars = Loadable({
	loader : () => import('./views/Base/Navbars'),
	loading: Loading,
});

const Navs = Loadable({
	loader : () => import('./views/Base/Navs'),
	loading: Loading,
});

const Paginations = Loadable({
	loader : () => import('./views/Base/Paginations'),
	loading: Loading,
});

const Popovers = Loadable({
	loader : () => import('./views/Base/Popovers'),
	loading: Loading,
});

const ProgressBar = Loadable({
	loader : () => import('./views/Base/ProgressBar'),
	loading: Loading,
});

const Switches = Loadable({
	loader : () => import('./views/Base/Switches'),
	loading: Loading,
});

const Tables = Loadable({
	loader : () => import('./views/Base/Tables'),
	loading: Loading,
});

const Tabs = Loadable({
	loader : () => import('./views/Base/Tabs'),
	loading: Loading,
});

const Tooltips = Loadable({
	loader : () => import('./views/Base/Tooltips'),
	loading: Loading,
});


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
	{
		path     : '/', exact    : true, name     : 'Home', component: DefaultLayout, 
	},
	{
		path     : '/base', exact    : true, name     : 'Base', component: Cards, 
	},
	{ path: '/base/cards', name: 'Cards', component: Cards },
	{ path: '/base/forms', name: 'Forms', component: Forms },
	{ path: '/base/switches', name: 'Switches', component: Switches },
	{ path: '/base/tables', name: 'Tables', component: Tables },
	{ path: '/base/tabs', name: 'Tabs', component: Tabs },
	{ path: '/base/breadcrumbs', name: 'Breadcrumbs', component: Breadcrumbs },
	{ path: '/base/carousels', name: 'Carousel', component: Carousels },
	{ path: '/base/collapses', name: 'Collapse', component: Collapses },
	{ path: '/base/dropdowns', name: 'Dropdowns', component: Dropdowns },
	{ path: '/base/jumbotrons', name: 'Jumbotrons', component: Jumbotrons },
	{ path: '/base/list-groups', name: 'List Groups', component: ListGroups },
	{ path: '/base/navbars', name: 'Navbars', component: Navbars },
	{ path: '/base/navs', name: 'Navs', component: Navs },
	{ path: '/base/paginations', name: 'Paginations', component: Paginations },
	{ path: '/base/popovers', name: 'Popovers', component: Popovers },
	{ path: '/base/progress-bar', name: 'Progress Bar', component: ProgressBar },
	{ path: '/base/tooltips', name: 'Tooltips', component: Tooltips },
];

export default routes;
