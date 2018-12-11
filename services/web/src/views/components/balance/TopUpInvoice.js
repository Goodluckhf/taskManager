import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'reactstrap';

class TopUpInvoice extends PureComponent {
	static propTypes = {
		invoice: propTypes.node,
		money: propTypes.number,
		purse: propTypes.string,
	};

	render() {
		return (
			<Card style={{ border: '1px solid #2aca76' }}>
				<CardHeader>Пополнение счета</CardHeader>
				<CardBody>
					{this.props.invoice}
					Сумма: {this.props.money} руб
					<br />
					Счет: {this.props.purse || 'через админа'}
					<br />
				</CardBody>
			</Card>
		);
	}
}

export default TopUpInvoice;
