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
			link: '',
			postCount: 6,
		};
	}

	static propTypes = {
		addWallSeek: PropTypes.func.isRequired,
		loading: PropTypes.bool,
		error: PropTypes.object,
	};

	handleLink = e => {
		this.setState({ link: e.target.value.trim() });
	};

	handlePostCount = e => {
		this.setState({ postCount: e.target.value.trim() });
	};

	onClick = () => {
		this.props.addWallSeek({
			link: this.state.link,
			postCount: this.state.postCount,
		});
	};

	render() {
		return (
			<Card>
				<CardHeader>
					<b>Добавить Задачу на слежку</b>
				</CardHeader>
				<CardBody>
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col>
									<Label>Ссылка на паблик</Label>
									<Input
										onChange={this.handleLink}
										type="text"
										placeholder="https://vk.com/nice.advice"
									/>
								</Col>
								<Col>
									<Label>Кол-во постов</Label>
									<Input
										onChange={this.handlePostCount}
										type="number"
										value={this.state.postCount}
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
						Добавить
					</LoadingButton>
				</CardFooter>
			</Card>
		);
	}
}

export default Form;
