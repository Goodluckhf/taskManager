import React, { PureComponent } from 'react';
import { Container }                     from 'reactstrap';
import { connect }                       from 'react-redux';
import Immutable                         from 'immutable';
import propTypes                         from 'prop-types';

import TopUpForm                                          from '../components/balance/TopUpForm';
import Layout                                             from '../layout/Layout';
import { loaderSelector }                                 from '../../lib/loader';
import { convertMoneyRequest, createTopUpInvoiceRequest } from '../../actions/billing';

class Balance extends PureComponent {
	static propTypes = {
		form              : propTypes.instanceOf(Immutable.Map),
		balance           : propTypes.number,
		comment           : propTypes.string,
		convertMoney      : propTypes.func,
		createTopUpInvoice: propTypes.func,
		convert           : propTypes.instanceOf(Immutable.Map),
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
						createTopUpInvoice={this.props.createTopUpInvoice}
						money={this.props.convert.get('money')}
						rate={this.props.convert.get('rate')}
						comment={this.props.comment}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	convertMoney      : data => dispatch(convertMoneyRequest(data)),
	createTopUpInvoice: data => dispatch(createTopUpInvoiceRequest(data)),
});

const mapStateToProps = state => ({
	form   : loaderSelector({ GROUPS__CREATE: 'loading' }, 'billingPage', state, ['form']),
	convert: state.billingPage.get('convert'),
	comment: state.billingPage.get('comment'),
	balance: state.auth.get('balance'),
});

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
