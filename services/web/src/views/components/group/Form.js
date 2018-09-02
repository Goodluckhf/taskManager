import React, { Component } from 'react';
import PropTypes            from 'prop-types';

import {
	Card, CardHeader, CardBody,
	Form as BootstrapForm, FormGroup, Label,
	Input, CardFooter,
}                           from 'reactstrap';
import LoadingButton, { S } from '../ui/LoadingButton';
//import LoadingButton from '../ui/LoadingButton';

class Form extends Component {
	constructor(props) {
		super(props);
		this.state = { link: '' };
	}
	
	static propTypes = {
		addGroup: PropTypes.func.isRequired,
		loading : PropTypes.bool,
		error   : PropTypes.string,
	};
	
	handleInput = (e) => {
		this.setState({ link: e.target.value.trim() });
	};
	
	onClick = () => {
		this.props.addGroup(this.state.link);
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
							{this.props.error ? <span>{this.props.error.message || this.props.error.toString()}</span> : ''}
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
