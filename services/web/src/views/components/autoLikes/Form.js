import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import {
	Card, CardHeader, CardBody,
	Form as BootstrapForm, FormGroup,
	Label, Input, CardFooter, Row, Col,
} from 'reactstrap';

import LoadingButton, { S }  from '../ui/LoadingButton';
import ApiError              from '../ui/ApiError';

class Form extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			publicHref   : '',
			likesCount   : 100,
			commentsCount: 33,
		};
	}
	static propTypes = {
		error         : propTypes.object,
		loading       : propTypes.bool,
		createAutoLike: propTypes.func,
	};
	
	handleCountInput = (e) => {
		this.setState({ likesCount: parseInt(e.target.value.trim(), 10) });
	};
	
	handleCommentsCountInput = (e) => {
		this.setState({ commentsCount: parseInt(e.target.value.trim(), 10) });
	};
	
	handlePublicInput = (e) => {
		this.setState({ publicHref: e.target.value.trim() });
	};
	
	onClick = () => {
		this.props.createAutoLike(this.state);
	};
	
	render() {
		return (
			<Card>
				<CardHeader><b>Добавить задачу на автолайкинг</b></CardHeader>
				<CardBody>
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col>
									<Label>Ссылка на паблик где должен выйти пост</Label>
									<Input onChange={this.handlePublicInput} type='text' placeholder='https://vk.com/nice.advice'/>
								</Col>
								<Col>
									<Label>Кол-во лайков (100 минимум)</Label>
									<Input onChange={this.handleCountInput} type='number' value={this.state.likesCount}/>
								</Col>
								<Col>
									<Label>Кол-во комментов</Label>
									<Input onChange={this.handleCommentsCountInput} type='number' value={this.state.commentsCount}/>
								</Col>
							</Row>
						</FormGroup>
						{this.props.error ? <ApiError style={{ marginTop: '24px' }} error={this.props.error}/> : ''}
					</BootstrapForm>
				</CardBody>
				<CardFooter>
					<LoadingButton
						data-size={S}
						data-color='green'
						loading={this.props.loading}
						onClick={this.onClick}
					>
						Добавить
					</LoadingButton>
				</CardFooter>
			</Card>
		);
	}
}

export default Form;
