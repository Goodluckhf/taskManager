import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import Immutable from 'immutable';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';

import Layout from '../layout/Layout';
import Form from '../components/vkUsers/Form';
import List from '../components/vkUsers/List';
import { removeRequest, createRequest, resumeRequest } from '../../actions/vkUsers';
import { getLoaderState, loaderSelector } from '../../lib/loader';

class VkUsers extends PureComponent {
	static propTypes = {
		addVkUsers: propTypes.func,
		remove: propTypes.func,
		resume: propTypes.func,
		form: propTypes.instanceOf(Immutable.Map),
		list: propTypes.instanceOf(Immutable.List),
		loading: propTypes.bool,
	};

	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Form
						addVkUsers={this.props.addVkUsers}
						loading={this.props.form.get('loading')}
						error={this.props.form.get('error')}
					/>
					<List
						items={this.props.list}
						loading={this.props.loading}
						remove={this.props.remove}
						resume={this.props.resume}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	addVkUsers: data => dispatch(createRequest(data)),
	remove: id => dispatch(removeRequest(id)),
	resume: id => dispatch(resumeRequest(id)),
});

const mapStateToProps = state => ({
	form: loaderSelector({ VK_USERS__CREATE: 'loading' }, 'vkUsersPage', state, ['form']),
	list: loaderSelector(
		{
			VK_USERS__REMOVE: 'remove_loading',
		},
		'vkUsersPage',
		state,
		['list', 'items'],
	),
	loading: getLoaderState('VK_USERS__LIST', state),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(VkUsers);
