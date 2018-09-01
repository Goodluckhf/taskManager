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
	};
	
	render() {
		return (
			<Card>
				<CardImg top width="100%" src="{this.props.image}" />
				<CardBody>
					<CardTitle>
						<a href={`https://vk.com/club${this.props.publicId}`}>
							${this.props.name}
						</a>
					</CardTitle>
					<Button>Button</Button>
				</CardBody>
			</Card>
		);
	}
}

export default Item;
