import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import Immutable                from 'immutable';
import { ListGroup } from 'reactstrap';
import Item from './Item';
import GroupItem from '../group/Item';

class List extends PureComponent {
	static propTypes = {
		items: propTypes.instanceOf(Immutable.List).isRequired,
	};
	
	render() {
		const items = this.props.items.map(item => (
			<Item key={item._id} {...item}>
				<GroupItem {...item.group} />
			</Item>
		));
		return (
			<ListGroup>
				{items}
			</ListGroup>
		);
	}
}

export default List;
