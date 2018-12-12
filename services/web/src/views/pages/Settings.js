import React, { PureComponent } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import propTypes from 'prop-types';
import { Container } from 'reactstrap';
import Layout from '../layout/Layout';
import SettingsForm from '../components/auth/SettingsForm';

import { loaderSelector } from '../../lib/loader';
import { createChatRequest } from '../../actions/auth';

class Settings extends PureComponent {
	static propTypes = {
		chatId: propTypes.number,
		error: propTypes.object,
		vkLink: propTypes.string.isRequired,
		systemVkLink: propTypes.string.isRequired,
		createChat: propTypes.func.isRequired,
		loaders: propTypes.instanceOf(Immutable.Map),
	};

	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<SettingsForm
						createChat={this.props.createChat}
						error={this.props.loaders.get('error')}
						loadingChat={this.props.loaders.get('loadingChat')}
						loadingUserData={this.props.loaders.get('loadingUserData')}
						vkLink={this.props.vkLink}
						systemVkLink={this.props.systemVkLink}
						chatId={this.props.chatId}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	createChat: data => dispatch(createChatRequest(data)),
});

const mapStateToProps = state => ({
	loaders: loaderSelector(
		{
			AUTH__CREATE_CHAT: 'loadingChat',
			AUTH__GET_USER_DATA: 'loadingUserData',
		},
		'auth',
		state,
	),
	chatId: state.auth.get('chatId'),
	vkLink: state.auth.get('vkLink'),
	systemVkLink: state.auth.get('systemVkLink'),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Settings);
