import Immutable from 'immutable';
import React, { Component } from 'react';
import propTyes from 'prop-types';
import { Card, CardHeader, CardBody, CardText } from 'reactstrap';

class List extends Component {
	static propTypes = {
		groups: propTyes.instanceOf(Immutable.List).isRequired,
	};
	
	render() {
		const groupsElements = this.props.groups.map(group => (
			<Card key={group}><CardText>{group}</CardText></Card>
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
