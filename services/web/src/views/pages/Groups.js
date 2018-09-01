import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { connect }   from 'react-redux';
import Immutable from 'immutable';
import propTypes from 'prop-types';

import Form         from '../components/group/Form';
import Layout       from '../layout/Layout';
import { requestCreate } from '../../actions/groups';
import List         from '../components/group/List';

class Groups extends Component {
	static propTypes = {
		addGroup: propTypes.func,
		form    : propTypes.instanceOf(Immutable.Map),
		groups  : propTypes.instanceOf(Immutable.Map),
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
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	addGroup: link => dispatch(requestCreate(link)),
});

const mapStateToProps = state => ({
	groups: state.groupPage.get('list'),
	form  : state.groupPage.get('form'),
});

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
