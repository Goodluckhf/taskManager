import React, { PureComponent } from 'react';
import { connect }              from 'react-redux';
import propTypes                from 'prop-types';

import LoginForm          from '../components/auth/LoginForm';
import { loaderSelector } from '../../lib/loader';
import { loginRequest }   from '../../actions/auth';

class Login extends PureComponent {
	static propTypes = {
		login    : propTypes.func.isRequired,
		loginForm: propTypes.object.isRequired,
	};
	
	render() {
		return (
			<LoginForm
				loading={this.props.loginForm.get('loading')}
				error={this.props.loginForm.get('error')}
				login={this.props.login}
			/>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	login: data => dispatch(loginRequest(data)),
});

const mapStateToProps = state => ({
	loginForm: loaderSelector({ AUTH__LOGIN: 'loading' }, 'auth', state),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
