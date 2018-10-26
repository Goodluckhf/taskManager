import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';
import { connect }              from 'react-redux';
import { Container }            from 'reactstrap';
import Immutable                          from 'immutable';
import Layout                             from '../layout/Layout';
import Form                               from '../components/autoLikes/Form';
import List                               from '../components/autoLikes/List';
import ExternalLinksForm                  from '../components/auth/ExternalLinksForm';
import {
	createRequest, filterChangeRequest,
	removeRequest, resumeRequest, stopRequest,
}                                         from '../../actions/autolikes';
import { loaderSelector, getLoaderState } from '../../lib/loader';
import { setExternalLinksRequest }        from '../../actions/auth';

class AutoLikes extends PureComponent {
	static propTypes = {
		form          : propTypes.instanceOf(Immutable.Map),
		auth          : propTypes.instanceOf(Immutable.Map),
		list          : propTypes.instanceOf(Immutable.List),
		createAutoLike: propTypes.func,
		filterChange  : propTypes.func,
		stop          : propTypes.func,
		resume        : propTypes.func,
		save          : propTypes.func,
		remove        : propTypes.func,
		loading       : propTypes.bool,
		filter        : propTypes.string,
		externalLinks : propTypes.arrayOf(propTypes.string),
	};
	
	
	//eslint-disable-next-line
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<ExternalLinksForm
						externalLinks={this.props.auth.get('externalLinks')}
						error={this.props.auth.get('error')}
						save={this.props.save}
						loading={this.props.auth.get('external_loading')}
					/>
					<Form
						error={this.props.form.get('error')}
						loading={this.props.form.get('loading')}
						createAutoLike={this.props.createAutoLike}
					/>
					<List
						stop={this.props.stop}
						remove={this.props.remove}
						resume={this.props.resume}
						filterChange={this.props.filterChange}
						items={this.props.list}
						loading={this.props.loading}
						filter={this.props.filter}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	createAutoLike: data => dispatch(createRequest(data)),
	filterChange  : filter => dispatch(filterChangeRequest(filter)),
	stop          : id => dispatch(stopRequest(id)),
	remove        : id => dispatch(removeRequest(id)),
	resume        : id => dispatch(resumeRequest(id)),
	save          : links => dispatch(setExternalLinksRequest(links)),
});

const mapStateToProps = state => ({
	form  : loaderSelector({ AUTO_LIKES__CREATE: 'loading' }, 'autoLikesPage', state, ['form']),
	filter: state.autoLikesPage.getIn(['list', 'filter']),
	auth  : loaderSelector({ AUTH__SET_EXTERNAL_LINKS: 'external_loading' }, 'auth', state),
	list  : loaderSelector(
		{
			AUTO_LIKES__STOP  : 'stop_loading',
			AUTO_LIKES__REMOVE: 'remove_loading',
			AUTO_LIKES__RESUME: 'resume_loading',
		},
		'autoLikesPage', state, ['list', 'items'],
	),
	loading: getLoaderState('AUTO_LIKES__LIST', state),
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoLikes);
