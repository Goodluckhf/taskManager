import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { connect }   from 'react-redux';

import Form         from '../components/group/Form';
import Layout       from '../layout/Layout';
import { addGroup } from '../../actions/groups';
import List         from '../components/group/List';

class Groups extends Component {
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Form {...this.props}/>
					<List {...this.props}/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	addGroup: link => dispatch(addGroup(link)),
});

const mapStateToProps = state => ({
	groups: state.groups,
});

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
