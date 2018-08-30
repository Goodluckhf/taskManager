import React, { Component } from 'react';
import {
	Card, CardHeader, CardBody,
	Container,
} from 'reactstrap';

import Layout from '../layout/Layout';

class Groups extends Component {
	//eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Card>
						<CardHeader><b>Паблики</b></CardHeader>
						<CardBody>Тут текст</CardBody>
					</Card>
				</Container>
			</Layout>
		);
	}
}

export default Groups;
