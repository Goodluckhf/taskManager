import React, { PureComponent }        from 'react';
import propTypes                       from 'prop-types';
import { connect }                     from 'react-redux';
import { Container }                   from 'reactstrap';
import Immutable                       from 'immutable';
import Layout                          from '../layout/Layout';
import Form                            from '../components/autoLikes/Form';
import { requestCreate } from '../../actions/autolikes';

class AutoLikes extends PureComponent {
	static propTypes = {
		form          : propTypes.instanceOf(Immutable.Map),
		createAutoLike: propTypes.func,
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
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	createAutoLike: data => dispatch(requestCreate(data)),
});

const mapStateToProps = state => ({
	form: state.autoLikesPage.get('form'),
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoLikes);
