import React, { PureComponent } from 'react';
import { Container }                     from 'reactstrap';
import { connect }                       from 'react-redux';
import Immutable                         from 'immutable';
import propTypes                         from 'prop-types';

import TopUpForm               from '../components/balance/TopUpForm';
import Layout                  from '../layout/Layout';
import { loaderSelector }      from '../../lib/loader';
import { convertMoneyRequest } from '../../actions/billing';

class Balance extends PureComponent {
	static propTypes = {
		form        : propTypes.instanceOf(Immutable.Map),
		balance     : propTypes.number,
		convertMoney: propTypes.func,
		convert     : propTypes.instanceOf(Immutable.Map),
	};
	
	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<TopUpForm
						loading={this.props.form.get('loading')}
						error={this.props.form.get('error')}
						balance={this.props.balance}
						convertMoney={this.props.convertMoney}
						money={this.props.convert.get('money')}
						rate={this.props.convert.get('rate')}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	convertMoney: data => dispatch(convertMoneyRequest(data)),
});

const mapStateToProps = state => ({
	form   : loaderSelector({ GROUPS__CREATE: 'loading' }, 'billingPage', state, ['form']),
	convert: state.billingPage.get('convert'),
	balance: state.auth.get('balance'),
});

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
