import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';

import {
	Card, CardImg, CardBody,
	CardTitle, CustomInput,
} from 'reactstrap';

class Item extends PureComponent {
	static propTypes = {
		publicId      : propTypes.string.isRequired,
		name          : propTypes.string.isRequired,
		image         : propTypes.string.isRequired,
		isTarget      : propTypes.bool.isRequired,
		changeIsTarget: propTypes.func,
		_id           : propTypes.string.isRequired,
		imageHeight   : propTypes.string,
	};
	
	handleCheckbox = (e) => {
		this.props.changeIsTarget(this.props._id, e.target.checked);
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
					<hr/>
					{this.props.changeIsTarget ?
						<CustomInput
							checked={this.props.isTarget}
							id={`isTarget_${this.props._id}`}
							onChange={this.handleCheckbox}
							type='checkbox'
							label='Учавствует в лайках'
						/>
						:
						<span className='h6'>
							{this.props.isTarget ? 'Учавстует в лайках' : 'Не учавствует в лайках' }
						</span>
					}
				</CardBody>
			</Card>
		);
	}
}

export default Item;
