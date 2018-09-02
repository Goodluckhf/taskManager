import React, { PureComponent } from 'react';
import { Container }                     from 'reactstrap';
import { connect }                       from 'react-redux';
import Immutable                         from 'immutable';
import propTypes                         from 'prop-types';

import Form         from '../components/group/Form';
import Layout       from '../layout/Layout';
import { requestCreate, changeIsTarget, requestFilterChange } from '../../actions/groups';
import List         from '../components/group/List';

class Groups extends PureComponent {
	static propTypes = {
		addGroup      : propTypes.func,
		changeIsTarget: propTypes.func,
		filterChange  : propTypes.func,
		form          : propTypes.instanceOf(Immutable.Map),
		groups        : propTypes.instanceOf(Immutable.Map),
	};
	
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Form
						addGroup={this.props.addGroup}
						loading={this.props.form.get('loading')}
						error={this.props.form.get('error')}
					/>
					<List
						items={this.props.groups.get('items')}
						loading={this.props.groups.get('loading')}
						changeIsTarget={this.props.changeIsTarget}
						filterChange={this.props.filterChange}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	addGroup      : data => dispatch(requestCreate(data)),
	changeIsTarget: (id, isTarget) => dispatch(changeIsTarget(id, isTarget)),
	filterChange  : filterState => dispatch(requestFilterChange(filterState)),
});

const mapStateToProps = state => ({
	groups: state.groupPage.get('list'),
	form  : state.groupPage.get('form'),
});

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
