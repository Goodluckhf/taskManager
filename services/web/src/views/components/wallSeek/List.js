import Immutable                from 'immutable';
import React, { PureComponent, Fragment } from 'react';
import propTypes                from 'prop-types';
import {
	Card, CardHeader,
	CardBody, Col, Row,
} from 'reactstrap';

import TaskItem  from './Item';
import GroupItem from '../group/Item';

class List extends PureComponent {
	static propTypes = {
		items  : propTypes.instanceOf(Immutable.List).isRequired,
		loading: propTypes.bool.isRequired,
		remove : propTypes.func.isRequired,
	};
	
	render() {
		const items = this.props.items.map((item) => {
			const group = item.get('group');
			
			return (
				<Fragment key={item.get('_id')}>
					<TaskItem
						remove={this.props.remove}
						_id={item.get('_id')}
						createdAt={item.get('createdAt')}
						postCount={item.get('postCount')}
						status={item.get('status')}
						remove_loading={item.get('remove_loading')}
						error={item.get('error')}
						_error={item.get('_error')}
					>
						<GroupItem
							_id={group.get('_id')}
							isTarget={group.get('isTarget')}
							image={group.get('image')}
							name={group.get('name')}
							publicId={group.get('publicId')}
						/>
					</TaskItem>
					<hr/>
				</Fragment>
			);
		});
		return (
			<Card>
				<CardHeader>
					<Row>
						<Col><b>Список задач на слежку</b></Col>
					</Row>
				</CardHeader>
				<CardBody>
					{this.props.loading ? 'Загружаю...' : items}
				</CardBody>
			</Card>
		);
	}
}

export default List;
