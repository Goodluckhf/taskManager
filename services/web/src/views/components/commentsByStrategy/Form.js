import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import csvtojson from 'csvtojson';

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
	Collapse,
	Button,
} from 'reactstrap';
import Multiselect from 'react-widgets/lib/Multiselect';
import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';
import { tagsArray } from '../../../constants';

class Form extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			postLink: '',
			csvStrategy: '',
			json: null,
			strategyOpen: false,
			botTags: [],
		};
	}

	static propTypes = {
		addCommentsStrategy: PropTypes.func.isRequired,
		loading: PropTypes.bool,
		error: PropTypes.object,
	};

	handleLink = e => {
		this.setState({ postLink: e.target.value.trim() });
	};

	handleCsv = e => {
		this.setState({ csvStrategy: e.target.value.trim() });
		csvtojson({
			colParser: {
				userFakeId: 'number',
				text: 'string',
				imageURL: item => (item.length > 0 ? item : null),
				likesCount: item => parseInt(item, 10) || 0,
				replyToCommentNumber: item => {
					const numberItem = parseInt(item, 10);
					if (Number.isFinite(numberItem)) {
						return numberItem;
					}
					return null;
				},
			},
			output: 'json',
			noheader: false,
			headers: ['userFakeId', 'text', 'imageURL', 'likesCount', 'replyToCommentNumber'],
		})
			.fromString(e.target.value.trim())
			.then(result => {
				this.setState({ json: result });
			});
	};

	onClick = () => {
		this.props.addCommentsStrategy({
			postLink: this.state.postLink,
			commentsStrategy: this.state.json,
			userTags: this.state.botTags,
		});
	};

	toggleStrategy = () => {
		this.setState({ strategyOpen: !this.state.strategyOpen });
	};

	onChangeTags = value => {
		this.setState({ botTags: value.map(o => o.value) });
	};

	render() {
		return (
			<Card>
				<CardHeader>
					<b>Прокрутка комментов по стратегии</b>
				</CardHeader>
				<CardBody>
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col md="4">
									<Label>Ссылка на пост</Label>
									<Input
										onChange={this.handleLink}
										type="text"
										placeholder="https://vk.com/wall-107952301_459"
									/>
								</Col>
								<Col md="6">
									<Label>csv стратегия комментов</Label>
									<Input
										onChange={this.handleCsv}
										type="textarea"
										value={this.state.csvStrategy}
										style={{ height: '200px' }}
									/>
								</Col>
								<Col md="2">
									<Label>Тэги</Label>
									<Multiselect
										defaultValue={['female', 'complete']}
										valueField={'value'}
										textField={'name'}
										data={tagsArray}
										onChange={this.onChangeTags}
									/>
								</Col>
							</Row>
							{this.state.json && (
								<Row>
									<Col>
										<span className="h6">Спарешенная стратегия:</span>
										<hr />
										<div>
											<Button
												color="primary"
												size="sm"
												onClick={this.toggleStrategy}
												style={{ marginBottom: '1rem' }}>
												свернуть/развернуть
											</Button>
										</div>
										<Collapse isOpen={this.state.strategyOpen}>
											<pre
												style={{
													backgroundColor: '#f0f3f5',
													padding: '15px',
												}}>
												{JSON.stringify(this.state.json, null, 2)}
											</pre>
										</Collapse>
									</Col>
								</Row>
							)}
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
