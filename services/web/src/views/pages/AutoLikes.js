import React, { PureComponent }     from 'react';
import propTypes                    from 'prop-types';
import { connect }                  from 'react-redux';
import { Container }                from 'reactstrap';
import Immutable                    from 'immutable';
import Layout                       from '../layout/Layout';
import Form                         from '../components/autoLikes/Form';
import List                         from '../components/autoLikes/List';
import { createRequest, filterChangeRequest, stopRequest } from '../../actions/autolikes';
import { loaderSelector } from '../../lib/loader';

class AutoLikes extends PureComponent {
	static propTypes = {
		form          : propTypes.instanceOf(Immutable.Map),
		list          : propTypes.instanceOf(Immutable.List),
		createAutoLike: propTypes.func,
		filterChange  : propTypes.func,
		stop          : propTypes.func,
		loading       : propTypes.bool,
	};
	
	
	//eslint-disable-next-line
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<Form
						error={this.props.form.get('error')}
						loading={this.props.form.get('loading')}
						createAutoLike={this.props.createAutoLike}
					/>
					<List
						stop={this.props.stop}
						filterChange={this.props.filterChange}
						items={this.props.list}
						loading={this.props.loading}
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
});

const mapStateToProps = state => ({
	form: loaderSelector({ AUTO_LIKES__CREATE: 'loading' }, 'autoLikesPage', state, ['form']),
	list: loaderSelector({ AUTO_LIKES__STOP: 'stop_loading', AUTO_LIKES__START: '' }, 'autoLikesPage', state, ['list', 'items']),
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoLikes);
