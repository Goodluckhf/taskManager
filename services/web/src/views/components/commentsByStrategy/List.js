import Immutable from 'immutable';
import React, { PureComponent, Fragment } from 'react';
import propTypes from 'prop-types';
import { Card, CardHeader, CardBody, Col, Row } from 'reactstrap';

import TaskItem from './Item';

class List extends PureComponent {
	static propTypes = {
		items: propTypes.instanceOf(Immutable.List).isRequired,
		loading: propTypes.bool.isRequired,
		remove: propTypes.func.isRequired,
		resume: propTypes.func.isRequired,
	};

	render() {
		const items = this.props.items.map(item => (
			<Fragment key={item.get('_id')}>
				<TaskItem
					remove={this.props.remove}
					resume={this.props.resume}
					_id={item.get('_id')}
					finishedCount={item.get('finishedCount')}
					tasksCount={item.get('tasksCount')}
					createdAt={item.get('createdAt')}
					strategy={item.get('commentsStrategy')}
					postLink={item.get('postLink')}
					status={item.get('status')}
					remove_loading={item.get('remove_loading')}
					resume_loading={item.get('resume_loading')}
					error={item.get('error')}
					_error={item.get('_error')}
				/>
				<hr />
			</Fragment>
		));
		return (
			<Card>
				<CardHeader>
					<Row>
						<Col>
							<b>Список задач</b>
							<span>{this.props.loading ? 'Обновляю...' : ''}</span>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>{items}</CardBody>
			</Card>
		);
	}
}

export default List;
