import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	AppFooter,
	AppHeader,
	AppSidebar,
	AppSidebarFooter,
	AppSidebarForm,
	AppSidebarHeader,
	AppSidebarMinimizer,
	AppSidebarNav,
}                    from '@coreui/react';
// sidebar nav config
import navigation    from '../../_nav';
import Footer        from './Footer';
import Header        from './Header';

class Layout extends Component {
	render() {
		return (
			<div className="app">
				<AppHeader fixed>
					<Header />
				</AppHeader>
				<div className="app-body">
					<AppSidebar fixed display="lg">
						<AppSidebarHeader />
						<AppSidebarForm />
						<AppSidebarNav navConfig={navigation} />
						<AppSidebarFooter />
						<AppSidebarMinimizer />
					</AppSidebar>
					<main className="main">{this.props.children}</main>
				</div>
				<AppFooter>
					<Footer />
				</AppFooter>
			</div>
		);
	}
}

Layout.propTypes = {
	children: PropTypes.node,
};

export default Layout;
