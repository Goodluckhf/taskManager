import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import {
	Card,
	CardHeader,
	CardBody,
	Form as BootstrapForm,
	FormGroup,
	Label,
	Input,
	CardFooter,
	Row,
	Col,
} from 'reactstrap';

import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

class Form extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			vkLink: '',
		};
	}

	static propTypes = {
		chatId: propTypes.number,
		error: propTypes.object,
		vkLink: propTypes.string.isRequired,
		loadingChat: propTypes.bool.isRequired,
		loadingUserData: propTypes.bool.isRequired,
		createChat: propTypes.func.isRequired,
		systemVkLink: propTypes.string.isRequired,
	};

	onLinkChange = e => {
		this.setState({ vkLink: e.target.value.trim() });
	};

	onClick = () => {
		this.props.createChat(this.state.vkLink);
	};

	render() {
		return (
			<Card>
				<CardHeader>
					<b>Настройки аккаунта</b>
				</CardHeader>
				<CardBody>
					<p>Заполните информацию, что бы приходили алерты в чат vk.com</p>
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col sm="12">
									<p>
										{/*eslint-disable-next-line max-len*/}
										1) Добавьте в друзья пользователя:{' '}
										<a
											rel="noopener noreferrer"
											target="_blank"
											href={this.props.systemVkLink}>
											{this.props.systemVkLink}
										</a>
										<br />
										2) Вставьте ссылку на профиль, куда вы хотите, что бы
										приходили оповещания
										<br />
										3) Нажмите на кнопку создать чат <br />
									</p>
								</Col>
								{this.props.loadingUserData ? (
									'Загружаю...'
								) : (
									<Col sm="12">
										<Label>Ссылка на профиль vk.com:</Label>
										{!this.props.chatId && (
											<Input
												onChange={this.onLinkChange}
												type="text"
												placeholder="https://vk.com/id123"
											/>
										)}
										{this.props.chatId && (
											<a
												rel="noopener noreferrer"
												target="_blank"
												href={this.props.vkLink}>
												{this.props.vkLink}
											</a>
										)}
									</Col>
								)}
							</Row>
						</FormGroup>
						{this.props.error ? (
							<ApiError style={{ marginTop: '24px' }} error={this.props.error} />
						) : (
							''
						)}
					</BootstrapForm>
				</CardBody>
				{!this.props.loadingUserData && !this.props.chatId && (
					<CardFooter>
						<LoadingButton
							data-size={S}
							data-color="green"
							loading={this.props.loadingChat}
							onClick={this.onClick}>
							Создать чат
						</LoadingButton>
					</CardFooter>
				)}
			</Card>
		);
	}
}

export default Form;
