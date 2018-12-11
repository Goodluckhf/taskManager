import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import Immutable from 'immutable';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';

import Layout from '../layout/Layout';
import Form from '../components/wallSeek/Form';
import List from '../components/wallSeek/List';
import { removeRequest, createRequest, resumeRequest } from '../../actions/wallSeek';
import { getLoaderState, loaderSelector } from '../../lib/loader';

class WallSeek extends PureComponent {
	static propTypes = {
		addWallSeek: propTypes.func,
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
						addWallSeek={this.props.addWallSeek}
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
	addWallSeek: data => dispatch(createRequest(data)),
	remove: id => dispatch(removeRequest(id)),
	resume: id => dispatch(resumeRequest(id)),
});

const mapStateToProps = state => ({
	form: loaderSelector({ WALLSEEK__CREATE: 'loading' }, 'wallSeekPage', state, ['form']),
	list: loaderSelector(
		{
			WALLSEEK__REMOVE: 'remove_loading',
			WALLSEEK__RESUME: 'resume_loading',
		},
		'wallSeekPage',
		state,
		['list', 'items'],
	),
	loading: getLoaderState('WALLSEEK__LIST', state),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(WallSeek);
