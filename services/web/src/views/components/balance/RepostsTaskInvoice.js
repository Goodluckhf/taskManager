import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'reactstrap';

class RepostsTaskInvoice extends PureComponent {
	static propTypes = {
		invoice: propTypes.node,
		count: propTypes.number,
		postLink: propTypes.string,
	};

	render() {
		return (
			<Card style={{ border: '1px solid #ffc107' }}>
				<CardHeader>Задача накрутки лайков</CardHeader>
				<CardBody>
					{this.props.invoice}
					<hr />
					Задача накрутки репостов
					<br />
					Кол-во: {this.props.count}
					<br />
					Ссылка:{' '}
					<a rel="noopener noreferrer" target="_blank" href={this.props.postLink}>
						{this.props.postLink}
					</a>
				</CardBody>
			</Card>
		);
	}
}

export default RepostsTaskInvoice;
