import React, { Component } from 'react';
import { Provider }         from 'react-redux';
import { ConnectedRouter }  from 'connected-react-router';
import {
	Route, Redirect,
	Switch, withRouter,
} from 'react-router';
import createHistory from 'history/createBrowserHistory';

// CoreUI Icons Set
import '@coreui/icons/css/coreui-icons.min.css';
// Import Flag Icons Set
import 'flag-icon-css/css/flag-icon.min.css';
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import Main styles for this application
import './scss/style.css';

import {
	Page404, Groups, AutoLikes,
	WallSeek, Login, Register, Settings,
} from './views/pages';

import { configureStore } from './store';

const history = createHistory();
const store   = configureStore(history);
class App extends Component {
	//eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<Switch>
						<Route exact path="/404" name="Page 404" component={withRouter(Page404)} />
						<Redirect exact from="/" to='/groups' />
						<Route path="/groups" exact name="Groups" component={withRouter(Groups)} />
						<Route path="/autolikes" exact name="AutoLikes" component={withRouter(AutoLikes)} />
						<Route path="/wallseek" exact name="WallSeek" component={withRouter(WallSeek)} />
						
						<Route path="/login" exact name="Login" component={withRouter(Login)} />
						<Route path="/register" exact name="Register" component={withRouter(Register)} />
						<Route path="/settings" exact name="Settings" component={withRouter(Settings)} />
						<Route component={Page404} />
					</Switch>
				</ConnectedRouter>
			</Provider>
		);
	}
}

export default App;
