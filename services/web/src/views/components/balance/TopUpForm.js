import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import {
	Card,
	CardHeader,
	CardBody,
	Form as BootstrapForm,
	FormGroup,
	Label,
	Input,
	CardFooter,
	Row,
	Col,
} from 'reactstrap';

import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError from '../ui/ApiError';

class TopUpForm extends PureComponent {
	static propTypes = {
		balance: propTypes.number,
		money: propTypes.number,
		rate: propTypes.number,
		create_loading: propTypes.bool,
		check_loading: propTypes.bool,
		error: propTypes.object,
		createTopUpInvoice: propTypes.func,
		checkPayment: propTypes.func,
		comment: propTypes.string,
		convertMoney: propTypes.func,
	};

	constructor(props) {
		super(props);
		this.state = {
			amount: 0,
			valid: false,
			changedAfterConfirm: false,
		};
	}

	handleAmountChange = e => {
		const value = e.target.value.trim();
		const amount = parseInt(value, 10);
		//eslint-disable-next-line no-restricted-globals
		const valid = !!amount && !isNaN(value) && !/[^0-9.]/.test(value);
		this.setState(
			{
				valid,
				amount: value,
				changedAfterConfirm: true,
			},
			() => {
				if (valid) {
					this.props.convertMoney(amount);
				}
			},
		);
	};

	onClick = () => {
		if (!this.state.valid) {
			return;
		}

		this.setState({
			changedAfterConfirm: false,
		});
		this.props.createTopUpInvoice(parseInt(this.state.amount, 10));
	};

	onClickCheck = () => {
		this.props.checkPayment();
	};

	render() {
		const validStyle = !this.state.valid ? { borderColor: 'red' } : {};
		return (
			<Card>
				<CardHeader>
					<b>Пополнеине баланса</b>
				</CardHeader>
				<CardBody>
					Пополнение баланса возможно через Yandex.Деньги
					<br />
					1) Укажите сумму пополнения
					<br />
					{/*eslint-disable-next-line*/}
					2) Нажмите кнопку "Пополнить"
					<br />
					3) Отправьте деньги на Yandex кашелек:{' '}
					<span style={{ color: 'tomato' }}>41001385438248</span>
					<br />
					{/*eslint-disable-next-line*/}
					4) Нажите на кнопку "Оплатил"
					<br />
					<span style={{ color: 'tomato' }}>Обязательно: </span>Укажите примечание
					(появится после нажатия)
					<hr />
					Текущий баланс: <b>{this.props.balance}</b>
					<br />
					Цена за 1 сердце: <b>{this.props.rate} руб.</b>
					<hr />
					<BootstrapForm>
						<FormGroup>
							<Row>
								<Col lg="6" md="6" sm="6">
									<Label>Кол-во сердец</Label>
									<Input
										style={validStyle}
										onChange={this.handleAmountChange}
										type="text"
										value={this.state.amount}
									/>
								</Col>
								<Col lg="6" md="6" sm="6">
									<Label>В рублях</Label>
									<Input disabled={true} type="number" value={this.props.money} />
								</Col>
								<Col lg="6" md="6" sm="6">
									<Label>Примечание к платежу</Label>
									<Input disabled={true} type="text" value={this.props.comment} />
									<span style={{ color: 'tomato' }}>
										Не забудьте указать примечание
									</span>
								</Col>
							</Row>
						</FormGroup>
						{this.props.error ? (
							<ApiError style={{ marginTop: '24px' }} error={this.props.error} />
						) : (
							''
						)}
					</BootstrapForm>
				</CardBody>
				<CardFooter>
					<LoadingButton
						disabled={!!this.props.comment.length && !this.state.changedAfterConfirm}
						style={
							this.props.comment.length && !this.state.changedAfterConfirm
								? { backgroundColor: 'gray' }
								: {}
						}
						data-size={S}
						data-color="green"
						loading={this.props.create_loading}
						onClick={this.onClick}>
						Пополнить
					</LoadingButton>
					{!!this.props.comment.length && !this.state.changedAfterConfirm && (
						<LoadingButton
							style={{ marginLeft: '10px' }}
							data-size={S}
							data-color="green"
							loading={this.props.check_loading}
							onClick={this.onClickCheck}>
							Оплатил
						</LoadingButton>
					)}
				</CardFooter>
			</Card>
		);
	}
}

export default TopUpForm;
