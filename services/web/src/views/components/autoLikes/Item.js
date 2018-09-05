import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import { Row, Col } from 'reactstrap';
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
			<Row>
				<Col xs={3}>{this.props.children}</Col>
				<Col xs={5}>
					<h4>Описание</h4>
					<div><span className='h6'>Кол-во лайков:</span> {this.props.likesCount}</div>
					<div><span className='h6'>Создана:</span> {moment(this.props.createdAt).format('MMMM Do YYYY, h:mm:ss')}</div>
				</Col>
				<Col>
					<h4>Действия</h4>
					<div></div>
				</Col>
			</Row>
		);
	}
}

export default Item;
