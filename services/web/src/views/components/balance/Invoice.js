import moment from 'moment';
import React, { PureComponent } from 'react';
import propTypes from 'prop-types';

class Invoice extends PureComponent {
	static propTypes = {
		createdAt: propTypes.string,
		paidAt: propTypes.string,
		amount: propTypes.number,
	};

	render() {
		return (
			<div>
				Создан: {moment(this.props.createdAt).format('MMMM Do YYYY, HH:mm:ss')}
				<br />
				Завершен: {moment(this.props.paidAt).format('MMMM Do YYYY, HH:mm:ss')}
				<br />
				Сердца: {this.props.amount}
				<br />
			</div>
		);
	}
}

export default Invoice;
