import Immutable                from 'immutable';
import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import {
	Card, CardHeader,
	CardBody, Col, Row,
} from 'reactstrap';

import GroupCard  from './Item';
import FormFilter from './FormFilter';

class List extends PureComponent {
	static propTypes = {
		items         : propTypes.instanceOf(Immutable.List).isRequired,
		filter        : propTypes.instanceOf(Immutable.Map).isRequired,
		loading       : propTypes.bool.isRequired,
		changeIsTarget: propTypes.func.isRequired,
		filterChange  : propTypes.func.isRequired,
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
						<Col><b>Список пабликов</b><span>{this.props.loading ? 'Загружаю...' : ''}</span></Col>
						<FormFilter
							search={this.props.filter.get('search')}
							isTarget={this.props.filter.get('isTarget')}
							change={this.props.filterChange}
						/>
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
