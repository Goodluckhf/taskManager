import Immutable from 'immutable';
import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap';
import InvoiceFormFilter from './InvoiceFormFilter';
import Invoice from './Invoice';
import LikesTaskInvoice from './LikesTaskInvoice';
import RepostsTaskInvoice from './RepostsTaskInvoice';
import CommentsTaskInvoice from './CommentsTaskInvoice';
import TopUpInvoice from './TopUpInvoice';

const invoiceMapper = {
	LikesTask: LikesTaskInvoice,
	RepostsTask: RepostsTaskInvoice,
	CommentsTask: CommentsTaskInvoice,
};

class InvoiceList extends PureComponent {
	static propTypes = {
		error: propTypes.object,
		loading: propTypes.bool,
		filterChange: propTypes.func,
		items: propTypes.instanceOf(Immutable.List).isRequired,
		filter: propTypes.string.isRequired,
	};

	render() {
		const list = this.props.items.map(item => {
			const baseInvoice = (
				<Invoice
					amount={item.get('amount')}
					createdAt={item.get('createdAt')}
					paidAt={item.get('paidAt')}
				/>
			);
			let Item = null;
			if (!item.get('task')) {
				Item = (
					<TopUpInvoice
						invoice={baseInvoice}
						money={item.get('money')}
						purse={item.get('purse')}
					/>
				);
			}

			const ConcreteInvoice = invoiceMapper[item.getIn(['task', '__t'])];
			if (!Item && !ConcreteInvoice) {
				console.error('no concrete invoice', item.getIn(['task', '__t'], item.get('_id')));
				Item = baseInvoice;
			}

			return (
				<Col xs="12" lg="4" md="6" key={item.get('_id')}>
					{Item || <ConcreteInvoice invoice={baseInvoice} {...item.get('task').toJS()} />}
				</Col>
			);
		});

		return (
			<Card>
				<CardHeader>
					<Row>
						<Col>
							<b>История платежей </b>
							<span>{this.props.loading ? 'Загружаю...' : ''}</span>
						</Col>
						<InvoiceFormFilter
							status={this.props.filter}
							change={this.props.filterChange}
						/>
					</Row>
				</CardHeader>
				<CardBody>
					<Row>{list}</Row>
				</CardBody>
			</Card>
		);
	}
}

export default InvoiceList;
