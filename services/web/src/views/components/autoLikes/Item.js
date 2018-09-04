import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import { ListGroupItem, Row, Col } from 'reactstrap';
import * as moment from 'moment';
import 'moment/locale/ru';

class Item extends PureComponent {
	static propTypes = {
		children  : propTypes.node,
		createdAt : propTypes.instanceOf(Date),
		likesCount: propTypes.number,
	};
	
	render() {
		return (
			<ListGroupItem>
				<Row>
					<Col>{this.props.children}</Col>
					<Col>
						<span>кол-во лайков: {this.props.likesCount}</span>
						<small className="text-muted">Создана: {moment(this.props.createdAt).format('MMMM Do YYYY, h:mm:ss')}</small>
					</Col>
				</Row>
			</ListGroupItem>
		);
	}
}

export default Item;
