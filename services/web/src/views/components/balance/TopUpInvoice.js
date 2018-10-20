import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';

class TopUpInvoice extends PureComponent {
	static propTypes = {
		invoice: propTypes.node,
		money  : propTypes.number,
		purse  : propTypes.string,
	};
	
	render() {
		return (
			<div>
				Пополнение счета<br/>
				{this.props.invoice}
				Сумма: {this.props.money} руб<br/>
				Счет: {this.props.purse || 'через админа'}<br/>
			</div>
		);
	}
}

export default TopUpInvoice;
