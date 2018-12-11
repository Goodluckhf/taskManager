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
	CustomInput,
} from 'reactstrap';

import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

const castToPositiveNumber = number => Math.abs(parseInt(number, 10) || 0);

class Form extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			publicHref: '',
			likesCount: 100,
			commentsCount: 33,
			repostsCount: 15,
			contentPosts: false,
		};
	}

	static propTypes = {
		error: propTypes.object,
		loading: propTypes.bool,
		createAutoLike: propTypes.func,
	};

	handleCountInput = e => {
		this.setState({ likesCount: castToPositiveNumber(e.target.value.trim()) });
	};

	handleCommentsCountInput = e => {
		this.setState({ commentsCount: castToPositiveNumber(e.target.value.trim()) });
	};

	handleRepostsCountInput = e => {
		this.setState({ repostsCount: castToPositiveNumber(e.target.value.trim()) });
	};

	handlePublicInput = e => {
		this.setState({ publicHref: e.target.value.trim() });
	};

	handleContentCheckbox = e => {
		this.setState({ contentPosts: !!e.target.checked });
	};

	onClick = () => {
		this.props.createAutoLike(this.state);
	};

	render() {
		return (
			<Card>
				<CardHeader>
					<b>Добавить задачу на автонакрутку</b>
				</CardHeader>
				<CardBody>
					Лайк = <b>1 сердце</b>; Коммент = <b>3 сердца</b>; Репост = <b>4 сердца</b>
					<br />
					<br />
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col lg="6" md="6" sm="6">
									<Label>Ссылка на паблик где должен выйти пост</Label>
									<Input
										onChange={this.handlePublicInput}
										type="text"
										placeholder="https://vk.com/nice.advice"
									/>
								</Col>
								<Col lg="6" md="6" sm="6">
									<Label>Кол-во лайков</Label>
									<Input
										onChange={this.handleCountInput}
										type="number"
										value={this.state.likesCount}
									/>
								</Col>
								<Col lg="6" md="6" sm="6">
									<Label>Кол-во комментов</Label>
									<Input
										onChange={this.handleCommentsCountInput}
										type="number"
										value={this.state.commentsCount}
									/>
								</Col>
								<Col lg="6" md="6" sm="6">
									<Label>Кол-во репостов</Label>
									<Input
										onChange={this.handleRepostsCountInput}
										type="number"
										value={this.state.repostsCount}
									/>
								</Col>
								<Col lg="12" md="12" sm="12" xs="12">
									<CustomInput
										id="handleContentCheckbox"
										onChange={this.handleContentCheckbox}
										type="checkbox"
										label="Проверять контентные посты тоже (все посты без ссылок)"
									/>
								</Col>
							</Row>
						</FormGroup>
						{this.props.error ? (
							<ApiError style={{ marginTop: '24px' }} error={this.props.error} />
						) : (
							''
						)}
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
