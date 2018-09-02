import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';

import {
	Card, CardImg, CardBody,
	CardTitle, Button,
} from 'reactstrap';

class Item extends PureComponent {
	static propTypes = {
		publicId: propTypes.string,
		name    : propTypes.string,
		image   : propTypes.string,
	};
	
	render() {
		return (
			<Card>
				<CardImg top src={this.props.image} />
				<CardBody>
					<CardTitle>
						<a rel='noopener noreferrer' target='_blank' href={`https://vk.com/club${this.props.publicId}`}>
							{this.props.name}
						</a>
					</CardTitle>
					<Button>Button</Button>
				</CardBody>
			</Card>
		);
	}
}

export default Item;
