import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {
	Button,
	Card,
	CardBody,
	CardGroup,
	Col,
	Container,
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
} from 'reactstrap';

import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

class LoginForm extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			email: '',
			password: '',
		};
	}

	static propTypes = {
		login: propTypes.func.isRequired,
		loading: propTypes.bool.isRequired,
		error: propTypes.object,
	};

	onClickLogin = e => {
		e.preventDefault();
		this.props.login(this.state);
	};

	handleEmailInput = e => {
		this.setState({
			email: e.target.value.trim(),
		});
	};

	handlePasswordInput = e => {
		this.setState({
			password: e.target.value.trim(),
		});
	};

	render() {
		return (
			<div className="app flex-row align-items-center">
				<Container>
					<Row className="justify-content-center">
						<Col md="8">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Form>
											<h1>Авторизация</h1>
											<p className="text-muted">Войдите в свой аккаунт</p>
											<InputGroup className="mb-3">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-user" />
													</InputGroupText>
												</InputGroupAddon>
												<Input
													type="text"
													onChange={this.handleEmailInput}
													placeholder="Email"
													autoComplete="email"
												/>
											</InputGroup>
											<InputGroup className="mb-4">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-lock" />
													</InputGroupText>
												</InputGroupAddon>
												<Input
													type="password"
													onChange={this.handlePasswordInput}
													placeholder="Пароль"
													autoComplete="password"
												/>
											</InputGroup>
											<Row>
												<Col xs="6">
													<LoadingButton
														onClick={this.onClickLogin}
														data-color="blue"
														className="px-4"
														data-size={S}
														loading={this.props.loading}>
														Войти
													</LoadingButton>
												</Col>
												<Col xs="6" className="text-right">
													<Button color="link" className="px-0">
														Забыли пароль?
													</Button>
												</Col>
											</Row>
										</Form>
									</CardBody>
								</Card>
								<Card
									className="text-white bg-primary py-5 d-md-down-none"
									style={{ width: '44%' }}>
									<CardBody className="text-center">
										<div>
											<h2>Регистрация</h2>
											<p>Еще нет аккаунта?</p>
											<Link to="/register">
												<Button color="primary" className="mt-3" active>
													Зарегистрироваться
												</Button>
											</Link>
										</div>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
					</Row>
					{this.props.error ? (
						<ApiError style={{ marginTop: '24px' }} error={this.props.error} />
					) : (
						''
					)}
				</Container>
			</div>
		);
	}
}

export default LoginForm;
