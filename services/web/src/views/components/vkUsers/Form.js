import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

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
import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

class Form extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			usersCredentials: '',
		};
	}

	static propTypes = {
		addVkUsers: PropTypes.func.isRequired,
		loading: PropTypes.bool,
		error: PropTypes.object,
	};

	handleList = e => {
		this.setState({ usersCredentials: e.target.value.trim() });
	};

	onClick = () => {
		if (!this.state.usersCredentials.length) {
			return;
		}

		const usersCredentials = this.state.usersCredentials.split('\n').map(credentials => {
			const splited = credentials.split(':');
			return {
				login: splited[0],
				password: splited[1],
			};
		});

		this.props.addVkUsers({
			usersCredentials,
		});
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
								<Col>
									<Label>
										Список аккаунтов пример: (login:pass) каждый с новой строки
									</Label>
									<Input
										onChange={this.handleList}
										type="textarea"
										value={this.state.usersCredentials}
										style={{ height: '200px' }}
									/>
								</Col>
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
					<LoadingButton
						data-size={S}
						data-color="green"
						loading={this.props.loading}
						onClick={this.onClick}>
						Создать
					</LoadingButton>
				</CardFooter>
			</Card>
		);
	}
}

export default Form;