import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Row, Col, Collapse, Button } from 'reactstrap';
import * as moment from 'moment';
import 'moment/locale/ru';
import Immutable from 'immutable';
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
			isOpen: false,
		};
	}

	static propTypes = {
		usersCredentials: propTypes.instanceOf(Immutable.List),
		createdAt: propTypes.string,
		postLink: propTypes.string,
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
		this.setState({ isOpen: !this.state.isOpen });
	};

	render() {
		return (
			<Row>
				<Col>
					<h4>Описание</h4>
					<div>
						<span className="h6">Создана:</span>{' '}
						{moment(this.props.createdAt).format('MMMM Do YYYY, HH:mm:ss')}
					</div>
					<div>
						<span className="h6">Статус:</span> {statusCodeToString[this.props.status]}
					</div>
					<div>
						<span className="h6">Список аккаунтов:</span>
						<div>
							<Button
								color="primary"
								size="sm"
								onClick={this.toggle}
								style={{ marginBottom: '1rem' }}>
								свернуть/развернуть
							</Button>
						</div>
						<Collapse isOpen={this.state.isOpen}>
							<pre style={{ backgroundColor: '#f0f3f5', padding: '15px' }}>
								{this.props.usersCredentials
									.toJS()
									.map(
										credentials =>
											`${credentials.login}:${credentials.password}`,
									)
									.join('\n')}
							</pre>
						</Collapse>
					</div>
					{this.props._error && (
						<ApiError title="Последняя ошибка" error={this.props._error} />
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
							onClick={this.onRemove}>
							Удалить
						</LoadingButton>
					</div>
				</Col>
			</Row>
		);
	}
}

export default Item;
