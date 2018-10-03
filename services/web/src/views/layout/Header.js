import React, { PureComponent }  from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/logo.svg';
import sygnet from '../../assets/img/brand/sygnet.svg';

const propTypes = {
	email : PropTypes.string.isRequired,
	logout: PropTypes.func.isRequired,
};

const defaultProps = {};

class Header extends PureComponent {
	onLogout = (e) => {
		e.preventDefault();
		this.props.logout();
	};
	
	render() {
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
						<NavLink href='#' onClick={this.onLogout}>Выйти</NavLink>
					</NavItem>
					<NavItem className="px-3">
						<Link to="/settings">{this.props.email}</Link>
					</NavItem>
				</Nav>
			</React.Fragment>
		);
	}
}

Header.propTypes    = propTypes;
Header.defaultProps = defaultProps;

export default Header;
