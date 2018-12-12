import React, { PureComponent } from 'react';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import propTypes from 'prop-types';

import TopUpForm from '../components/balance/TopUpForm';
import InvoiceList from '../components/balance/InvoiceList';
import Layout from '../layout/Layout';
import { getLoaderState, loaderSelector } from '../../lib/loader';
import {
	checkPaymentRequest,
	convertMoneyRequest,
	createTopUpInvoiceRequest,
	filterChangeRequest,
} from '../../actions/billing';

class Balance extends PureComponent {
	static propTypes = {
		form: propTypes.instanceOf(Immutable.Map),
		invoices: propTypes.instanceOf(Immutable.Map),
		loading: propTypes.bool,
		balance: propTypes.number,
		comment: propTypes.string,
		convertMoney: propTypes.func,
		createTopUpInvoice: propTypes.func,
		checkPayment: propTypes.func,
		filterChange: propTypes.func,
		convert: propTypes.instanceOf(Immutable.Map),
	};

	render() {
		return (
			<Layout>
				<Container fluid={true}>
					<TopUpForm
						create_loading={this.props.form.get('create_loading')}
						check_loading={this.props.form.get('check_loading')}
						error={this.props.form.get('error')}
						balance={this.props.balance}
						convertMoney={this.props.convertMoney}
						createTopUpInvoice={this.props.createTopUpInvoice}
						checkPayment={this.props.checkPayment}
						money={this.props.convert.get('money')}
						rate={this.props.convert.get('rate')}
						comment={this.props.comment}
					/>
					<InvoiceList
						items={this.props.invoices.get('items')}
						loading={this.props.loading}
						filter={this.props.invoices.get('filter')}
						filterChange={this.props.filterChange}
					/>
				</Container>
			</Layout>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	convertMoney: data => dispatch(convertMoneyRequest(data)),
	createTopUpInvoice: data => dispatch(createTopUpInvoiceRequest(data)),
	checkPayment: () => dispatch(checkPaymentRequest()),
	filterChange: data => dispatch(filterChangeRequest(data)),
});

const mapStateToProps = state => ({
	form: loaderSelector(
		{
			BILLING__CREATE_TOPUP_INVOICE: 'create_loading',
			BILLING__CHECK_PAYMENT: 'check_loading',
		},
		'billingPage',
		state,
		['form'],
	),
	convert: state.billingPage.get('convert'),
	comment: state.billingPage.get('comment'),
	balance: state.auth.get('balance'),
	invoices: state.billingPage.get('list'),
	loading: getLoaderState('BILLING__LIST', state),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Balance);
