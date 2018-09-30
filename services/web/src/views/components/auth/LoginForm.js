import React, { PureComponent } from 'react';

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

class LoginForm extends PureComponent {
	//eslint-disable-next-line
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
														<i className="icon-user"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="text" placeholder="Email" autoComplete="email" />
											</InputGroup>
											<InputGroup className="mb-4">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-lock"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="password" placeholder="Пароль" autoComplete="password" />
											</InputGroup>
											<Row>
												<Col xs="6">
													<Button color="primary" className="px-4">Войти</Button>
												</Col>
												<Col xs="6" className="text-right">
													<Button color="link" className="px-0">Забыли пароль?</Button>
												</Col>
											</Row>
										</Form>
									</CardBody>
								</Card>
								<Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
									<CardBody className="text-center">
										<div>
											<h2>Регистрация</h2>
											<p>Еще нет аккаунта?</p>
											<Button color="primary" className="mt-3" active>Зарегистрироваться сейчас!</Button>
										</div>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default LoginForm;
