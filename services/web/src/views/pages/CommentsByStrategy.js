import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import Immutable from 'immutable';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';

import Layout from '../layout/Layout';
import Form from '../components/commentsByStrategy/Form';
import List from '../components/commentsByStrategy/List';
import { removeRequest, createRequest, resumeRequest } from '../../actions/commentsByStrategy';
import { getLoaderState, loaderSelector } from '../../lib/loader';

class CommentsByStrategy extends PureComponent {
	static propTypes = {
		addCommentsStrategy: propTypes.func,
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
						addCommentsStrategy={this.props.addCommentsStrategy}
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
	addCommentsStrategy: data => dispatch(createRequest(data)),
	remove: id => dispatch(removeRequest(id)),
	resume: id => dispatch(resumeRequest(id)),
});

const mapStateToProps = state => ({
	form: loaderSelector(
		{ COMMENTS_BY_STRATEGY__CREATE: 'loading' },
		'commentsByStrategyPage',
		state,
		['form'],
	),
	list: loaderSelector(
		{
			COMMENTS_BY_STRATEGY__REMOVE: 'remove_loading',
		},
		'commentsByStrategyPage',
		state,
		['list', 'items'],
	),
	loading: getLoaderState('COMMENTS_BY_STRATEGY__LIST', state),
});

export default connect(mapStateToProps, mapDispatchToProps)(CommentsByStrategy);
