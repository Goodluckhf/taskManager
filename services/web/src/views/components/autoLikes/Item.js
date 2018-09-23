import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import { List }                 from 'immutable';
import { Row, Col }             from 'reactstrap';
import * as moment              from 'moment';
import 'moment/locale/ru';
import LoadingButton, { XS }     from '../ui/LoadingButton';
import ApiError             from '../ui/ApiError';

const statusCodeToString = {
	0: <span className='text-primary'>Ожидает</span>,
	1: <span className='text-warning'>Выполняется</span>,
	2: <span className='text-success'>Выполнена</span>,
	3: <span className='text-muted'>Отменена</span>,
	4: <span className='text-info'>Проверяется</span>,
};

const taskTypeToString = {
	CommentsTask: 'Накрутка комментов',
	LikesCommon : 'Накрутка лайков',
};

class Item extends PureComponent {
	static propTypes = {
		children      : propTypes.node,
		createdAt     : propTypes.string,
		lastHandleAt  : propTypes.string,
		likesCount    : propTypes.number,
		commentsCount : propTypes.number,
		_id           : propTypes.string,
		status        : propTypes.number,
		error         : propTypes.object,
		lastTasks     : propTypes.instanceOf(List),
		stop_loading  : propTypes.bool,
		remove_loading: propTypes.bool,
		stop          : propTypes.func,
		remove        : propTypes.func,
	};
	
	onStop = () => {
		this.props.stop(this.props._id);
	};
	
	onRemove = () => {
		this.props.remove(this.props._id);
	};
	
	render() {
		const lastTasks = this.props.lastTasks.map((task) => {
			const title = taskTypeToString[task.get('__t')];
			return (
				<div key={task.get('_id')}>
					<span className='h6'>{title}: {statusCodeToString[task.get('status')]}</span>
					{task.get('_error') && <ApiError title={title} error={task.get('_error').toJS()}/>}
				</div>
			);
		});
		return (
			<Row>
				<Col xs={3}>{this.props.children}</Col>
				<Col xs={6}>
					<h4>Описание</h4>
					<div><span className='h6'>Кол-во лайков:</span> {this.props.likesCount}</div>
					<div><span className='h6'>Кол-во комментов:</span> {this.props.commentsCount}</div>
					<div><span className='h6'>Создана:</span> {moment(this.props.createdAt).format('MMMM Do YYYY, HH:mm:ss')}</div>
					<div><span className='h6'>Последняя в :</span> {moment(this.props.lastHandleAt).format('MMMM Do YYYY, HH:mm:ss')}</div>
					<div><span className='h6'>Статус:</span> {statusCodeToString[this.props.status]}</div>
					{lastTasks}
					{this.props.error && <ApiError error={this.props.error}/>}
				</Col>
				<Col>
					<h4>Действия</h4>
					<div>
						<LoadingButton
							data-size={XS}
							data-color='green'
							loading={this.props.stop_loading}
							onClick={this.onStop}
						>
							Остановить
						</LoadingButton>
					</div>
					<div style={{ marginTop: '10px' }}>
						<LoadingButton
							data-size={XS}
							data-color='red'
							loading={this.props.remove_loading}
							onClick={this.onRemove}
						>
							Удалить
						</LoadingButton>
					</div>
				</Col>
			</Row>
		);
	}
}

export default Item;
