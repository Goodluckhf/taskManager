import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import { Row, Col }             from 'reactstrap';
import * as moment              from 'moment';
import 'moment/locale/ru';
import LoadingButton, { S }     from '../ui/LoadingButton';

const statusCodeToString = {
	0: <span className='text-primary'>Ожидает</span>,
	1: <span className='text-warning'>Ожидает</span>,
	2: <span className='text-success'>Выполнена</span>,
	3: <span className='text-muted'>Отменена</span>,
};

class Item extends PureComponent {
	static propTypes = {
		children: propTypes.node,
		
		// createdAt : propTypes.instanceOf(Date),
		// likesCount: propTypes.number,
		// _id       : propTypes.string,
		// status    : propTypes.number,
		AUTO_LIKES__STOP_loading: propTypes.bool,
		stop                    : propTypes.func,
		item                    : propTypes.object,
	};
	
	onClick = () => {
		this.props.stop(this.props.item.get('_id'));
	};
	
	render() {
		return (
			<Row>
				<Col xs={3}>{this.props.children}</Col>
				<Col xs={5}>
					<h4>Описание</h4>
					<div><span className='h6'>Кол-во лайков:</span> {this.props.item.get('likesCount')}</div>
					<div><span className='h6'>Создана:</span> {moment(this.props.item.get('createdAt')).format('MMMM Do YYYY, h:mm:ss')}</div>
					<div><span className='h6'>Статус:</span> {statusCodeToString[this.props.item.get('status')]}</div>
				</Col>
				<Col>
					<h4>Действия</h4>
					<div>
						<LoadingButton
							data-size={S}
							data-color='green'
							loading={this.props.item.get('AUTO_LIKES__STOP_loader') || false}
							onClick={this.onClick}
						>
							Остановить
						</LoadingButton>
					</div>
				</Col>
			</Row>
		);
	}
}

export default Item;
