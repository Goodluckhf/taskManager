import React, { Component } from 'react';
import propTypes            from 'prop-types';
import { Link }             from 'react-router-dom';

import {
	Card,
	CardBody,
	Col,
	Container,
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
}                           from 'reactstrap';
import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError             from '../ui/ApiError';

class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email               : '',
			password            : '',
			passwordConfirmation: '',
			passwordError       : null,
		};
	}
	
	static propTypes = {
		register      : propTypes.func.isRequired,
		error         : propTypes.object,
		loading       : propTypes.bool,
		hasAccountLink: propTypes.string,
	};
	
	onEmailChange = (e) => {
		this.setState({ email: e.target.value.trim() });
	};
	
	onPasswordChange = (e) => {
		this.setState({ password: e.target.value.trim() });
	};
	
	onPasswordConfirmationChange = (e) => {
		this.setState({ passwordConfirmation: e.target.value.trim() });
	};
	
	onRegister = (e) => {
		e.preventDefault();
		if (!this.state.password.length || this.state.password !== this.state.passwordConfirmation) {
			this.setState({
				passwordError: { message: 'Пароли не совпадают!' },
			});
			return;
		}
		
		this.props.register({
			email   : this.state.email,
			password: this.state.password,
		});
	};
	
	render() {
		return (
			<div className="app flex-row align-items-center">
				<Container>
					<Row className="justify-content-center">
						<Col md="6">
							<Card className="mx-4">
								<CardBody className="p-4">
									<Form>
										<h1>Регистрация</h1>
										<p className="text-muted">Создай аккаунт</p>
										<InputGroup className="mb-3">
											<InputGroupAddon addonType="prepend">
												<InputGroupText>@</InputGroupText>
											</InputGroupAddon>
											<Input onChange={this.onEmailChange} type="text" placeholder="Email" autoComplete="email"/>
										</InputGroup>
										<InputGroup className="mb-3">
											<InputGroupAddon addonType="prepend">
												<InputGroupText>
													<i className="icon-lock"></i>
												</InputGroupText>
											</InputGroupAddon>
											<Input onChange={this.onPasswordChange} type="password" placeholder="Password" autoComplete="new-password"/>
										</InputGroup>
										<InputGroup className="mb-4">
											<InputGroupAddon addonType="prepend">
												<InputGroupText>
													<i className="icon-lock"></i>
												</InputGroupText>
											</InputGroupAddon>
											<Input
												type="password"
												placeholder="Repeat password"
												autoComplete="new-password"
												onChange={this.onPasswordConfirmationChange}
											/>
										</InputGroup>
										<LoadingButton
											loading={this.props.loading}
											data-color="green"
											data-size={S}
											onClick={this.onRegister}
										>
											Создать
										</LoadingButton>
										<Link style={{ marginLeft: '15px' }} to={this.props.hasAccountLink}>Уже есть аккаунт</Link>
									</Form>
								</CardBody>
							</Card>
						</Col>
					</Row>
					{this.props.error ? <ApiError style={{ marginTop: '24px' }} error={this.props.error}/> : ''}
					{this.state.passwordError ? <ApiError style={{ marginTop: '24px' }} error={this.state.passwordError}/> : ''}
				</Container>
			</div>
		);
	}
}

export default Register;
