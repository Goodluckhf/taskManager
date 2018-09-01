import Immutable from 'immutable';
import React, { Component } from 'react';
import propTyes from 'prop-types';
import { Card, CardHeader, CardBody } from 'reactstrap';
import GroupCard from './Item';

class List extends Component {
	static propTypes = {
		items  : propTyes.instanceOf(Immutable.List).isRequired,
		loading: propTyes.bool.isRequired,
	};
	
	render() {
		const groupsElements = this.props.items.map(group => (
			<GroupCard key={group} {...group} />
		));
		
		return (
			<Card>
				<CardHeader>Список пабликов</CardHeader>
				<CardBody>
					{groupsElements}
				</CardBody>
			</Card>
		);
	}
}

export default List;
