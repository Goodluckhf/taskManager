import React, { Component } from 'react';
import {
	Card, CardHeader, CardBody,
	Container, Row, Col,
} from 'reactstrap';

import Layout from '../layout/Layout';

class Groups extends Component {
	//eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Row>
						<Col xs={12}>
							<Card>
								<CardHeader><b>Паблики</b></CardHeader>
								<CardBody>Тут текст</CardBody>
							</Card>
						</Col>
					</Row>
				</Container>
			</Layout>
		);
	}
}

export default Groups;
