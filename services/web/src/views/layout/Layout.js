import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
	AppFooter,
	AppHeader,
	AppSidebar,
	AppSidebarFooter,
	AppSidebarForm,
	AppSidebarHeader,
	AppSidebarMinimizer,
	AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import Footer from './Footer';
import { logout } from '../../actions/auth';
import Header from './Header';
import ApiError from '../components/ui/ApiError';

class Layout extends PureComponent {
	render() {
		return (
			<div className="app">
				<AppHeader fixed>
					<Header
						balance={this.props.balance}
						logout={this.props.logout}
						email={this.props.email}
					/>
				</AppHeader>
				<div className="app-body">
					<AppSidebar fixed display="lg">
						<AppSidebarHeader />
						<AppSidebarForm />
						{/*Такой костыль, потому что шаблон не умеет в immutable*/}
						<AppSidebarNav navConfig={this.props.routes.toJS()} />
						<AppSidebarFooter />
						<AppSidebarMinimizer />
					</AppSidebar>
					<main className="main">
						{this.props.fatalError.size ? (
							<ApiError error={this.props.fatalError.toJS()} />
						) : (
							''
						)}
						{this.props.children}
					</main>
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
	routes: PropTypes.object,
	fatalError: PropTypes.object,
	email: PropTypes.string.isRequired,
	logout: PropTypes.func.isRequired,
	balance: PropTypes.number,
};

const mapStateToProps = state => ({
	routes: state.routes,
	fatalError: state.fatalError,
	email: state.auth.get('email'),
	balance: state.auth.get('balance'),
});

const mapDispatchToProps = dispatch => ({
	logout: () => dispatch(logout()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Layout);
