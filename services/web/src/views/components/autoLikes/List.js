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
	};
	
	render() {
		const items = this.props.items.map((item) => {
			const group = item.get('group');
			return (
				<Fragment key={item.get('_id')}>
					<Item
						stop={this.props.stop}
						_id={item.get('_id')}
						createdAt={item.get('createdAt')}
						likesCount={item.get('likesCount')}
						status={item.get('status')}
						stop_loading={item.get('stop_loading')}
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
						<Col><b>Список задач на автолайкинг</b></Col>
						<FormFilter change={this.props.filterChange}/>
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
