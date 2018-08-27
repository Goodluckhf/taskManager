import React, { Component } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/logo.svg';
import sygnet from '../../assets/img/brand/sygnet.svg';

const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

class Header extends Component {
	render() {
		// eslint-disable-next-line
    const { children, ...attributes } = this.props;

		return (
			<React.Fragment>
				<AppSidebarToggler className="d-lg-none" display="md" mobile />
				<AppNavbarBrand
					full={{
						src   : logo, width : 89, height: 25, alt   : 'CoreUI Logo', 
					}}
					minimized={{
						src   : sygnet, width : 30, height: 30, alt   : 'CoreUI Logo', 
					}}
				/>
				<AppSidebarToggler className="d-md-down-none" display="lg" />

				<Nav className="d-md-down-none ml-auto" navbar>
					<NavItem className="px-3">
						<NavLink href="/">Dashboard</NavLink>
					</NavItem>
					<NavItem className="px-3">
						<NavLink href="#/users">Users</NavLink>
					</NavItem>
					<NavItem className="px-3">
						<NavLink href="#">Settings</NavLink>
					</NavItem>
				</Nav>
			</React.Fragment>
		);
	}
}

Header.propTypes    = propTypes;
Header.defaultProps = defaultProps;

export default Header;
