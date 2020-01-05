import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import propTypes from 'prop-types';

import RegisterForm from '../components/auth/RegisterForm';
import { loaderSelector } from '../../lib/loader';
import { registerRequest } from '../../actions/auth';

class Register extends PureComponent {
	static propTypes = {
		register: propTypes.func.isRequired,
		registerForm: propTypes.object.isRequired,
		hasAccountLink: propTypes.string.isRequired,
	};

	render() {
		return (
			<RegisterForm
				loading={this.props.registerForm.get('loading')}
				error={this.props.registerForm.get('error')}
				register={this.props.register}
				hasAccountLink={this.props.hasAccountLink}
			/>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	register: data => dispatch(registerRequest(data)),
});

const mapStateToProps = state => ({
	registerForm: loaderSelector({ AUTH__REGISTER: 'loading' }, 'auth', state),
	hasAccountLink: '/login',
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
