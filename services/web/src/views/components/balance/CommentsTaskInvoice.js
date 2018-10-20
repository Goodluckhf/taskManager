import React, { PureComponent }        from 'react';
import propTypes                       from 'prop-types';
import { Card, CardHeader, CardBody }  from 'reactstrap';

class CommentsTaskInvoice extends PureComponent {
	static propTypes = {
		invoice      : propTypes.node,
		commentsCount: propTypes.number,
		postLink     : propTypes.string,
	};
	
	render() {
		return (
			<Card>
				<CardHeader>Задача накрутки комментов</CardHeader>
				<CardBody>
					{this.props.invoice}
					<hr/>
					Кол-во: {this.props.commentsCount}<br/>
					Ссылка: <a rel='noopener noreferrer' target='_blank' href={this.props.postLink}>{this.props.postLink}</a>
				</CardBody>
			</Card>
		);
	}
}

export default CommentsTaskInvoice;
