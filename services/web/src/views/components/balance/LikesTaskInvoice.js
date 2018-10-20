import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import { Card, CardHeader, CardBody }  from 'reactstrap';

class LikesTaskInvoice extends PureComponent {
	static propTypes = {
		invoice   : propTypes.node,
		likesCount: propTypes.number,
		postLink  : propTypes.string,
	};
	
	render() {
		return (
			<Card>
				<CardHeader>Задача накрутки лайков</CardHeader>
				<CardBody>
					{this.props.invoice}
					<hr/>
					Кол-во: {this.props.likesCount}<br/>
					Ссылка: <a rel='noopener noreferrer' target='_blank' href={this.props.postLink}>{this.props.postLink}</a>
				</CardBody>
			</Card>
		);
	}
}

export default LikesTaskInvoice;
