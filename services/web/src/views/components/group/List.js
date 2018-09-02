import Immutable                from 'immutable';
import React, { PureComponent } from 'react';
import propTyes                 from 'prop-types';
import {
	Card, CardHeader,
	CardBody, Col, Row,
} from 'reactstrap';

import GroupCard  from './Item';
import FormFilter from './FormFilter';

class List extends PureComponent {
	static propTypes = {
		items         : propTyes.instanceOf(Immutable.List).isRequired,
		loading       : propTyes.bool.isRequired,
		changeIsTarget: propTyes.func.isRequired,
		filterChange  : propTyes.func.isRequired,
	};
	
	render() {
		const groupsElements = this.props.items.map(group => (
			<Col lg={3} sm={4} xs={12} key={group.get('_id')}>
				<GroupCard {...group.toJS()} changeIsTarget={this.props.changeIsTarget}/>
			</Col>
		));
		
		return (
			<Card>
				<CardHeader>
					<Row>
						<Col><b>Список пабликов</b></Col>
						<FormFilter change={this.props.filterChange}/>
					</Row>
				</CardHeader>
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
