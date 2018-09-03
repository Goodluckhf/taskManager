import React, { PureComponent } from 'react';
import { Container } from 'reactstrap';
import Layout        from '../layout/Layout';
import Form from '../components/autoLikes/Form';

class AutoLikes extends PureComponent {
	//eslint-disable-next-line
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Form/>
				</Container>
			</Layout>
		);
	}
}

export default AutoLikes;
