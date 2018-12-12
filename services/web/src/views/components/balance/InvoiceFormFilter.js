import React, { PureComponent, Fragment } from 'react';
import propTypes from 'prop-types';
import { Col, CustomInput } from 'reactstrap';

class InvoiceFormFilter extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			status: this.props.status,
			_status: this.props.status,
		};

		this.filterAllId = Math.random();
		this.filterTopupId = Math.random();
		this.filterTasksId = Math.random();
	}

	static getDerivedStateFromProps(props, state) {
		const newState = {};
		if (props.status !== state._status) {
			newState.status = props.status;
			newState._status = props.status;
		}

		if (!Object.keys(newState).length) {
			return null;
		}

		return newState;
	}

	static propTypes = {
		change: propTypes.func,
		status: propTypes.string,
	};

	onFilterChange = e => {
		this.setState({ status: e.target.value }, () => {
			this.props.change(this.state.status);
		});
	};

	render() {
		return (
			<Fragment>
				<Col xs="2">
					<CustomInput
						id={this.filterAllId}
						onChange={this.onFilterChange}
						type="radio"
						label="Все"
						value="all"
						checked={this.state.status === 'all'}
						name="invoice_form_filter"
					/>
				</Col>
				<Col xs="2">
					<CustomInput
						id={this.filterTopupId}
						onChange={this.onFilterChange}
						type="radio"
						label="Пополнение"
						value="topup"
						checked={this.state.status === 'topup'}
						name="invoice_form_filter"
					/>
				</Col>
				<Col xs="2">
					<CustomInput
						id={this.filterTasksId}
						onChange={this.onFilterChange}
						type="radio"
						label="Задачи"
						value="tasks"
						checked={this.state.status === 'tasks'}
						name="invoice_form_filter"
					/>
				</Col>
			</Fragment>
		);
	}
}

export default InvoiceFormFilter;
