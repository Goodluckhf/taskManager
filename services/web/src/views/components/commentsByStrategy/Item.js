import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Row, Col, Collapse, Button } from 'reactstrap';
import * as moment from 'moment';
import 'moment/locale/ru';
import LoadingButton, { XS } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

const statusCodeToString = {
	waiting: <span className="text-primary">Ожидает</span>,
	pending: <span className="text-warning">Выполняется</span>,
	finished: <span className="text-success">Выполнена</span>,
	skipped: <span className="text-muted">Остановлена</span>,
	checking: <span className="text-info">Проверяется</span>,
};

class Item extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isStrategiesOpen: false,
			isErrorsOpen: false,
		};
	}

	static propTypes = {
		strategy: propTypes.object,
		tasksCount: propTypes.number,
		finishedCount: propTypes.number,
		createdAt: propTypes.string,
		postLink: propTypes.string,
		subTasksErrors: propTypes.object,
		_id: propTypes.string,
		status: propTypes.string,
		error: propTypes.object,
		_error: propTypes.object,
		remove_loading: propTypes.bool,
		resume_loading: propTypes.bool,
		remove: propTypes.func,
		resume: propTypes.func,
	};

	onRemove = () => {
		this.props.remove(this.props._id);
	};

	toggle = () => {
		this.setState({ isStrategiesOpen: !this.state.isStrategiesOpen });
	};

	toggleErrors = () => {
		this.setState({ isErrorsOpen: !this.state.isErrorsOpen });
	};

	render() {
		return (
			<Row>
				<Col xs={3}>
					<div>
						<span className="h6">Ссылка на пост:</span>
						<br />
						<a rel="noopener noreferrer" target="_blank" href={this.props.postLink}>
							{this.props.postLink}
						</a>
					</div>
				</Col>
				<Col xs={7}>
					<h4>Описание</h4>
					<div>
						<span className="h6">Создана:</span>{' '}
						{moment(this.props.createdAt).format('MMMM Do YYYY, HH:mm:ss')}
					</div>
					<div>
						<span className="h6">Статус:</span> {statusCodeToString[this.props.status]}
					</div>
					<div>
						<span className="h6">Выполнено:</span>
						<span style={{ fontStyle: 'italic' }}>
							&nbsp;{this.props.finishedCount} / {this.props.tasksCount}
						</span>
					</div>
					<div>
						<span className="h6">Стратегия:</span>
						<div>
							<Button
								color="primary"
								size="sm"
								onClick={this.toggle}
								style={{ marginBottom: '1rem' }}>
								свернуть/развернуть
							</Button>
						</div>
						<Collapse isOpen={this.state.isStrategiesOpen}>
							<pre style={{ backgroundColor: '#f0f3f5', padding: '15px' }}>
								{JSON.stringify(this.props.strategy, null, 2)}
							</pre>
						</Collapse>
					</div>
					{this.props.subTasksErrors && !!this.props.subTasksErrors.size && (
						<div>
							<span style={{ color: 'red' }} className="h6">
								Ошибки в подзадачах:
							</span>
							<div>
								<Button
									color="primary"
									size="sm"
									onClick={this.toggleErrors}
									style={{ marginBottom: '1rem' }}>
									свернуть/развернуть
								</Button>
							</div>

							<Collapse isOpen={this.state.isErrorsOpen}>
								{this.props.subTasksErrors.map((error, index) => (
									<ApiError key={index} title={`Ошибка коммента`} error={error} />
								))}
							</Collapse>
						</div>
					)}
					{this.props._error && (
						<ApiError title="Ошибка (Задача остановлена)" error={this.props._error} />
					)}
					{this.props.error && <ApiError error={this.props.error} />}
				</Col>
				<Col>
					<h4>Действия</h4>
					<div>
						<LoadingButton
							data-size={XS}
							data-color="red"
							loading={this.props.remove_loading}
							onClick={this.onRemove}
							disabled={this.props.status === 'pending'}>
							Удалить
						</LoadingButton>
					</div>
				</Col>
			</Row>
		);
	}
}

export default Item;
