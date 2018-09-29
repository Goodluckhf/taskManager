import React, { PureComponent, Fragment } from 'react';
import propTypes                from 'prop-types';
import Immutable                from 'immutable';
import {
	Card, CardBody,
	CardHeader, Row, Col,
} from 'reactstrap';
import Item from './Item';
import GroupItem from '../group/Item';
import FormFilter from './FormFilter';

class List extends PureComponent {
	static propTypes = {
		items       : propTypes.instanceOf(Immutable.List).isRequired,
		filterChange: propTypes.func.isRequired,
		stop        : propTypes.func.isRequired,
		remove      : propTypes.func.isRequired,
		loading     : propTypes.bool.isRequired,
		filter      : propTypes.string.isRequired,
	};
	
	render() {
		const items = this.props.items.map((item) => {
			const group     = item.get('group');
			const lastTasks = item.get('subTasks');
			
			return (
				<Fragment key={item.get('_id')}>
					<Item
						stop={this.props.stop}
						remove={this.props.remove}
						_id={item.get('_id')}
						createdAt={item.get('createdAt')}
						lastHandleAt={item.get('lastHandleAt')}
						likesCount={item.get('likesCount')}
						commentsCount={item.get('commentsCount')}
						repostsCount={item.get('repostsCount')}
						status={item.get('status')}
						stop_loading={item.get('stop_loading')}
						remove_loading={item.get('remove_loading')}
						error={item.get('error')}
						lastTasks={lastTasks}
					>
						<GroupItem
							_id={group.get('_id')}
							isTarget={group.get('isTarget')}
							image={group.get('image')}
							name={group.get('name')}
							publicId={group.get('publicId')}
						/>
					</Item>
					<hr/>
				</Fragment>
			);
		});
		return (
			<Card>
				<CardHeader>
					<Row>
						<Col><b>Список задач на автолайкинг</b><span>{this.props.loading ? 'Обновляю...' : ''}</span></Col>
						<FormFilter filter={this.props.filter} change={this.props.filterChange}/>
					</Row>
				</CardHeader>
				<CardBody>
					{items}
				</CardBody>
			</Card>
		);
	}
}

export default List;
