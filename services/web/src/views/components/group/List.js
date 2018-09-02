import Immutable from 'immutable';
import React, { Component } from 'react';
import propTyes from 'prop-types';
import { Card, CardHeader, CardBody, Col, Row } from 'reactstrap';
import GroupCard from './Item';

class List extends Component {
	static propTypes = {
		items         : propTyes.instanceOf(Immutable.List).isRequired,
		loading       : propTyes.bool.isRequired,
		changeIsTarget: propTyes.func.isRequired,
	};
	
	render() {
		const groupsElements = this.props.items.map(group => (
			<Col lg={3} sm={4} xs={12} key={group.get('_id')}>
				<GroupCard {...group.toJS()} changeIsTarget={this.props.changeIsTarget}/>
			</Col>
		));
		
		return (
			<Card>
				<CardHeader>Список пабликов</CardHeader>
				<CardBody>
					<Row>
						{groupsElements}
					</Row>
				</CardBody>
			</Card>
		);
	}
}

export default List;
