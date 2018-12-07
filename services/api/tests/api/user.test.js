import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';
import mongoose from '../../../../lib/mongoose';
import UserApi from '../../api/UserApi';
import Billing from '../../billing/Billing';
import { CheckPaymentFailure, ValidationError } from '../../api/errors';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('UserApi', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	describe('createTopUpInvoice', () => {
		it('should throw error if user is not Billing user', async () => {
			const user = mongoose.model('PremiumUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const api = new UserApi({}, billing, {}, this.config, loggerMock);
			const account = billing.createAccount(user);
			const promise = api.createTopUpInvoice(account, 100);
			expect(promise).to.be.rejectedWith(ValidationError);
		});

		it('should update old active invoice if exists', async () => {
			this.config.rubbleRatio = 0.05;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = mongoose.model('TopUpInvoice').createInstance({
				amount: 70,
				user,
			});
			await invoice.save();

			const api = new UserApi({}, billing, {}, this.config, loggerMock);
			const account = billing.createAccount(user);
			const promise = api.createTopUpInvoice(account, 100);
			await expect(promise).to.be.fulfilled;
			const findedOldInvoice = await mongoose.model('TopUpInvoice').findById(invoice._id);
			expect(findedOldInvoice.amount).to.be.equals(100);
			expect(findedOldInvoice.note).to.be.equals(invoice.note);
			expect(findedOldInvoice.money).to.be.equals(5);
		});

		it('should create new invoice if there is no active exists', async () => {
			this.config.rubbleRatio = 0.01;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);

			const api = new UserApi({}, billing, {}, this.config, loggerMock);
			const account = billing.createAccount(user);
			const promise = api.createTopUpInvoice(account, 100);
			await expect(promise).to.be.fulfilled;
			const findedInvoice = await mongoose.model('TopUpInvoice').findOne({
				user: user.id,
			});
			expect(findedInvoice.amount).to.be.equals(100);
			expect(findedInvoice.money).to.be.equals(1);
		});
	});

	describe('CheckPayment', () => {
		it('should throw error if account is not billing', async () => {
			const user = mongoose.model('PremiumUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, {}, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(ValidationError);
		});

		it('should throw error if there is no active invoices', async () => {
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, {}, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(ValidationError);
		});

		it('should not accept payment if money lt invoice money', async () => {
			this.config.rubbleRatio = 0.1;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = billing.createTopUpInvoice(user, 100);
			await invoice.save();

			const axios = {
				post() {
					return {
						data: {
							operations: [
								{
									amount: 8,
									message: invoice.note,
									codepro: false,
									status: 'success',
									type: 'incoming-transfer',
								},
							],
						},
					};
				},
			};

			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, axios, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(CheckPaymentFailure);
		});

		it('should not accept payment if note is not equals', async () => {
			this.config.rubbleRatio = 0.1;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = billing.createTopUpInvoice(user, 100);
			await invoice.save();

			const axios = {
				post() {
					return {
						data: {
							operations: [
								{
									amount: 10,
									message: `${invoice.note}asd`,
									codepro: false,
									status: 'success',
									type: 'incoming-transfer',
								},
							],
						},
					};
				},
			};

			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, axios, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(CheckPaymentFailure);
		});

		it('should not accept payment if payment with protection', async () => {
			this.config.rubbleRatio = 0.1;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = billing.createTopUpInvoice(user, 100);
			await invoice.save();

			const axios = {
				post() {
					return {
						data: {
							operations: [
								{
									amount: 10,
									message: invoice.note,
									codepro: true,
									status: 'success',
									type: 'incoming-transfer',
								},
							],
						},
					};
				},
			};

			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, axios, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(CheckPaymentFailure);
		});

		it('should not accept payment if payment status is not success', async () => {
			this.config.rubbleRatio = 0.1;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = billing.createTopUpInvoice(user, 100);
			await invoice.save();

			const axios = {
				post() {
					return {
						data: {
							operations: [
								{
									amount: 10,
									message: invoice.note,
									codepro: false,
									type: 'incoming-transfer',
								},
							],
						},
					};
				},
			};

			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, axios, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(CheckPaymentFailure);
		});

		it('should not accept payment if payment type is not transfer', async () => {
			this.config.rubbleRatio = 0.1;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = billing.createTopUpInvoice(user, 100);
			await invoice.save();

			const axios = {
				post() {
					return {
						data: {
							operations: [
								{
									amount: 10,
									message: invoice.note,
									codepro: true,
									status: 'success',
									type: 'incsfer',
								},
							],
						},
					};
				},
			};

			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, axios, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.rejectedWith(CheckPaymentFailure);
		});

		it('should accept payment', async () => {
			this.config.rubbleRatio = 0.1;
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email: 'test',
			});

			const billing = new Billing(this.config, loggerMock);
			const invoice = billing.createTopUpInvoice(user, 100);
			await invoice.save();

			const axios = {
				post() {
					return {
						data: {
							operations: [
								//eslint-disable-next-line object-curly-newline
								{
									amount: 10,
									message: invoice.note,
									codepro: false,
									status: 'success',
									type: 'incoming-transfer',
								},
							],
						},
					};
				},
			};

			const account = billing.createAccount(user);
			const api = new UserApi({}, billing, axios, this.config, loggerMock);
			const promise = api.checkPayment(account);
			await expect(promise).to.be.fulfilled;
			const findedInvoice = await mongoose.model('TopUpInvoice').findById(invoice._id);
			expect(user.balance).to.be.equals(100);
			expect(findedInvoice.status).to.be.equals(mongoose.model('Invoice').status.paid);
			expect(findedInvoice.paidAt).to.be.not.null;
		});
	});
});
