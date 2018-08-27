import DefaultLayout from './views/layout/Layout';

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
	{
		path     : '/',
		exact    : true,
		name     : 'Home',
		component: DefaultLayout,
	},
];

export default routes;
