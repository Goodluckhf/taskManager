import React, { Component } from 'react';
import PropTypes            from 'prop-types';
import { connect }          from 'react-redux';

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
import Footer        from './Footer';
import Header        from './Header';

class Layout extends Component {
	render() {
		console.log(this.props);
		return (
			<div className="app">
				<AppHeader fixed>
					<Header />
				</AppHeader>
				<div className="app-body">
					<AppSidebar fixed display="lg">
						<AppSidebarHeader />
						<AppSidebarForm />
						<AppSidebarNav navConfig={this.props.routes} />
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
	routes  : PropTypes.object,
};

const mapStateToProps = (state) => {
	console.log(state);
	return {
		routes: state.routes,
	};
};

export default connect(mapStateToProps)(Layout);
