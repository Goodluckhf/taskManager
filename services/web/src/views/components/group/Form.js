import React, { Component } from 'react';
import PropTypes            from 'prop-types';

import {
	Card, CardHeader, CardBody,
	Form as BootstrapForm, FormGroup, Label,
	Input, Button, CardFooter,
} from 'reactstrap';

class Form extends Component {
	constructor(props) {
		super(props);
		
		this.state = { link: '' };
	}
	
	static propTypes = {
		addGroup: PropTypes.func.isRequired,
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
						</FormGroup>
					</BootstrapForm>
				</CardBody>
				<CardFooter>
					<Button onClick={this.onClick}>Добавить</Button>
				</CardFooter>
			</Card>
		);
	}
}

export default Form;
