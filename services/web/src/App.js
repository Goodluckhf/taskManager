import React, { Component } from 'react';
import {
	BrowserRouter,
	Route,
	Switch,
	Redirect,
} from 'react-router-dom';
import { Provider } from 'react-redux';

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

import { Page404, HomePage }            from './views/pages';
import { configureStore, initialState } from './store';

const store = configureStore(initialState);


class App extends Component {
	//eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<Provider store={store}>
				<BrowserRouter>
					<Switch>
						<Route exact path="/404" name="Page 404" component={Page404} />
						<Redirect exact from="/" to='/groups' />
						<Route path="/groups" exact name="Groups" component={HomePage} />
						<Route component={Page404} />
					</Switch>
				</BrowserRouter>
			</Provider>
		);
	}
}

export default App;
