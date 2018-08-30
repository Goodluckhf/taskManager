import React, { Component } from 'react';
import {
	Card, CardHeader, CardBody,
	Container, Form, FormGroup,
	Label, Input, Button, CardFooter,
} from 'reactstrap';

import Layout from '../layout/Layout';

class Groups extends Component {
	constructor(props) {
		super(props);
		
		this.state = { link: '' };
	}
	
	handleInput = (e) => {
		this.setState({ link: e.target.value });
	};
	
	handleSubmit = () => {
		console.log(this.state.link);
	};
	
	//eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Card>
						<CardHeader><b>Добавить паблик</b></CardHeader>
						<CardBody>
							<Form>
								<FormGroup>
									<Label>Ссылка на паблик</Label>
									<Input onChange={this.handleInput} type='text' placeholder='https://vk.com/nice.advice'/>
								</FormGroup>
							</Form>
						</CardBody>
						<CardFooter>
							<Button onClick={this.handleSubmit}>Добавить</Button>
						</CardFooter>
					</Card>
				</Container>
			</Layout>
		);
	}
}

export default Groups;
