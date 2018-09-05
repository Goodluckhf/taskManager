import React, { PureComponent }     from 'react';
import propTypes                    from 'prop-types';
import { connect }                  from 'react-redux';
import { Container }                from 'reactstrap';
import Immutable                    from 'immutable';
import Layout                       from '../layout/Layout';
import Form                         from '../components/autoLikes/Form';
import List                         from '../components/autoLikes/List';
import { requestCreate, requestFilterChange } from '../../actions/autolikes';

class AutoLikes extends PureComponent {
	static propTypes = {
		form          : propTypes.instanceOf(Immutable.Map),
		list          : propTypes.instanceOf(Immutable.Map),
		createAutoLike: propTypes.func,
		filterChange  : propTypes.func,
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
					<List filterChange={this.props.filterChange} items={this.props.list.get('items')} />
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	createAutoLike: data => dispatch(requestCreate(data)),
	filterChange  : filter => dispatch(requestFilterChange(filter)),
});

const mapStateToProps = state => ({
	form: state.autoLikesPage.get('form'),
	list: state.autoLikesPage.get('list'),
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoLikes);
