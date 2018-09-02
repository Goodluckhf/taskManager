import React, { Component } from 'react';
import PropTypes            from 'prop-types';

import {
	Card, CardHeader, CardBody,
	Form as BootstrapForm, FormGroup, Label,
	Input, CardFooter, CustomInput,
}                           from 'reactstrap';
import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError             from '../ui/ApiError';

class Form extends Component {
	constructor(props) {
		super(props);
		this.state = {
			link    : '',
			isTarget: false,
		};
	}
	
	static propTypes = {
		addGroup: PropTypes.func.isRequired,
		loading : PropTypes.bool,
		error   : PropTypes.object,
	};
	
	handleInput = (e) => {
		this.setState({ link: e.target.value.trim() });
	};
	
	handleCheckbox = (e) => {
		this.setState({ isTarget: e.target.checked });
	};
	
	onClick = () => {
		this.props.addGroup({
			link    : this.state.link,
			isTarget: this.state.isTarget,
		});
	};
	
	render() {
		return (
			<Card>
				<CardHeader><b>Добавить паблик</b></CardHeader>
				<CardBody>
					<BootstrapForm>
						<FormGroup>
							<Label>Ссылка на паблик</Label>
							<Input onChange={this.handleInput} type='text' placeholder='https://vk.com/nice.advice'/>
							<CustomInput id='isTarget' onChange={this.handleCheckbox} type='checkbox' label='Учавствует в лайках'/>
							{this.props.error ? <ApiError style={{ marginTop: '24px' }} error={this.props.error}/> : ''}
						</FormGroup>
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
