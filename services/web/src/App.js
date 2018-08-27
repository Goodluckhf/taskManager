import React, { Component }                from 'react';
import { HashRouter, Route, Switch }       from 'react-router-dom';
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

import { Page404, HomePage } from './views/pages';

class App extends Component {
	//eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<HashRouter>
				<Switch>
					<Route exact path="/404" name="Page 404" component={Page404} />
					<Route path="/" exact name="Home" component={HomePage} />
					<Route component={Page404} />
				</Switch>
			</HashRouter>
		);
	}
}

export default App;
