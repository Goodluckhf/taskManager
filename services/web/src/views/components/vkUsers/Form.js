import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import chunk from 'lodash/chunk';

import {
	Card,
	CardHeader,
	CardBody,
	Form as BootstrapForm,
	FormGroup,
	Input,
	CardFooter,
	Label,
	Row,
	Col,
} from 'reactstrap';
import LoadingButton, { S, XS } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

class Form extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			usersCredentials: '',
			proxiesCredentials: '',
			groupId: '',
		};
	}

	static propTypes = {
		addVkUsers: PropTypes.func.isRequired,
		checkAllUsers: PropTypes.func.isRequired,
		addGroup: PropTypes.func.isRequired,
		loading: PropTypes.bool,
		error: PropTypes.object,
		checkAllUsersLoading: PropTypes.bool,
		addGroupLoading: PropTypes.bool,
	};

	handleCredentialsList = e => {
		this.setState({ usersCredentials: e.target.value.trim() });
	};

	handleProxiesList = e => {
		this.setState({ proxiesCredentials: e.target.value.trim() });
	};

	onClick = () => {
		if (!this.state.usersCredentials.length) {
			return;
		}

		if (!this.state.proxiesCredentials.length) {
			return;
		}

		const usersCredentials = this.state.usersCredentials.split('\n').map(credentials => {
			const splited = credentials.split(':');
			return {
				login: splited[0],
				password: splited[1],
			};
		});

		const proxiesCredentials = this.state.proxiesCredentials.split('\n').map(credentials => {
			const splitedProxy = credentials.split(':');

			return {
				url: `${splitedProxy[0]}:${splitedProxy[1]}`,
				login: splitedProxy[2],
				password: splitedProxy[3],
			};
		});

		if (proxiesCredentials.length > usersCredentials.length) {
			const proxyDiff = proxiesCredentials.length - usersCredentials.length;
			window.alert(`Проксей больше чем акков! Убери ${proxyDiff} проксей из списка`);
			return;
		}

		const vkCredentialsChunks = chunk(
			usersCredentials,
			proxiesCredentials.length / usersCredentials.length,
		);

		vkCredentialsChunks.forEach((vkUserChunk, index) => {
			const proxy = proxiesCredentials[index];
			vkUserChunk.forEach(vkUser => {
				vkUser.proxy = proxy;
			});
		});

		this.props.addVkUsers({
			usersCredentials,
		});
	};

	onClickCheckAllUsers = e => {
		e.preventDefault();
		this.props.checkAllUsers();
	};

	onClickAddGroup = e => {
		e.preventDefault();
		if (this.state.groupId.length === 0) {
			return;
		}

		this.props.addGroup({ groupId: this.state.groupId });
		this.setState({ groupId: '' });
	};

	handleGroupIdInput = e => {
		this.setState({ groupId: e.target.value.trim() });
	};

	render() {
		return (
			<Card>
				<CardHeader>
					<b>Добавление акков vk.com</b>
				</CardHeader>
				<CardBody>
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col md="5">
									<Label>
										Список аккаунтов пример: <b>login:pass</b> каждый с новой
										строки
									</Label>
									<Input
										onChange={this.handleCredentialsList}
										type="textarea"
										value={this.state.usersCredentials}
										style={{ height: '200px' }}
									/>
								</Col>
								<Col md="7">
									<Label>
										Список проксей пример: <b>ip:port:login:password</b> каждый
										с новой строки
									</Label>
									<Input
										onChange={this.handleProxiesList}
										type="textarea"
										value={this.state.proxiesCredentials}
										style={{ height: '200px' }}
									/>
								</Col>

								{/*<Col md="2" style={{displa}}>*/}
								{/*	<Label>Добавить группу</Label>*/}
								{/*	<Row>*/}
								{/*		<Col xs="12">*/}
								{/*			<Input*/}
								{/*				placeholder="id группы (-12345)"*/}
								{/*				onChange={this.handleGroupIdInput}*/}
								{/*				type="text"*/}
								{/*				value={this.state.groupId}*/}
								{/*			/>*/}
								{/*		</Col>*/}
								{/*		<Col style={{ marginTop: '15px' }}>*/}
								{/*			<LoadingButton*/}
								{/*				data-size={XS}*/}
								{/*				data-color="green"*/}
								{/*				loading={this.props.addGroupLoading}*/}
								{/*				onClick={this.onClickAddGroup}>*/}
								{/*				Добавить*/}
								{/*			</LoadingButton>*/}
								{/*		</Col>*/}
								{/*	</Row>*/}
								{/*</Col>*/}
							</Row>
							{this.props.error ? (
								<ApiError style={{ marginTop: '24px' }} error={this.props.error} />
							) : (
								''
							)}
						</FormGroup>
					</BootstrapForm>
				</CardBody>
				<CardFooter>
					<Row>
						<Col xs="3">
							<LoadingButton
								data-size={S}
								data-color="green"
								loading={this.props.loading}
								onClick={this.onClick}>
								Создать
							</LoadingButton>
						</Col>
						<Col xs="7"></Col>
						<Col xs="2">
							<LoadingButton
								data-size={XS}
								data-color="mint"
								loading={this.props.checkAllUsersLoading}
								onClick={this.onClickCheckAllUsers}>
								Проверить все акки
							</LoadingButton>
						</Col>
					</Row>
				</CardFooter>
			</Card>
		);
	}
}

export default Form;
