import mongoose             from 'mongoose';
import _                    from 'lodash';
import config               from 'config';
import { expect }           from 'chai';
import Billing              from '../../billing/Billing';
import initModels           from '../../model';
import BillingAccount       from '../../billing/BillingAccount';
import PremiumAccount       from '../../billing/PremiumAccount';
import { NotEnoughBalance } from '../../api/errors/tasks';


before(() => {
	initModels(mongoose.connection);
});

after(() => {
	mongoose.connection.models = {};
});

describe('Billing', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	it('Should throw error if try to create invoice with invalid type', () => {
		this.config.prices = { likes: 10 };
		
		const billing = new Billing(this.config);
		const action = () => {
			billing.createInvoice('repos', 10);
		};
		
		expect(action).to.throw(/Invalid invoice type/);
	});
	
	it('should calculate price depends on quantity and price from config', () => {
		this.config.prices = { test: 123 };
		const billing      = new Billing(this.config);
		
		expect(billing.calculatePrice('test', 10)).to.be.equals(1230);
	});
	
	it('should create invoice with price depending on config', () => {
		this.config.prices = { test: 321 };
		const billing = new Billing(this.config);
		
		const invoice = billing.createInvoice('test', 10);
		expect(invoice.price).to.be.equals(3210);
		expect(invoice.invoiceType).to.be.equals('test');
	});
	
	it('should create billing user if user type is billing', () => {
		const user = mongoose.model('AccountUser').createInstance({ password: 'asdasd' });
		const billing = new Billing(this.config);
		const account = billing.createAccount(user);
		expect(account).to.be.instanceOf(BillingAccount);
	});
	
	it('should create premium user if user type is premium', () => {
		const user = mongoose.model('PremiumUser').createInstance({ password: 'asdasd' });
		const billing = new Billing(this.config);
		const account = billing.createAccount(user);
		expect(account).to.be.instanceOf(PremiumAccount);
	});
	
	it('getTotalPrice should correct calculate price', () => {
		this.config.prices = { test: 32, test1: 43 };
		const billing = new Billing(this.config);
		const invoices = [
			billing.createInvoice('test', 123),
			billing.createInvoice('test1', 11),
		];
		
		// eslint-disable-next-line no-mixed-operators
		const expectedPrice = 32 * 123 + 11 * 43;
		expect(billing.getTotalPrice(invoices)).to.be.equals(expectedPrice);
	});
	
	describe('BillingAccount', () => {
		it('new billing user should has empty balance', () => {
			const user = mongoose.model('AccountUser').createInstance({ password: 'asdasd' });
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			expect(account.availableBalance).to.be.equals(0);
		});
		
		it('should throw error if invoice is more then available balance', () => {
			this.config.prices = { test: 12 };
			
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 100,
			});
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			const invoice = billing.createInvoice('test', 100);
			expect(account.canPay.bind(account, invoice)).to.throw(NotEnoughBalance);
		});
		
		it('should throw error trying freeze balance with less balance', () => {
			this.config.prices = { test: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 100,
			});
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			const invoice = billing.createInvoice('test', 10);
			const freezeMoney = () => {
				account.freezeMoney(invoice);
			};
			
			expect(freezeMoney).to.throw(NotEnoughBalance);
		});
		
		it('should freeze money', () => {
			this.config.prices = { test: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 130,
			});
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			const invoice = billing.createInvoice('test', 10);
			account.freezeMoney(invoice);
			expect(account.user.freezeBalance).to.be.equals(billing.getTotalPrice(invoice));
		});
		
		it('available balance should decrease after freeze money', () => {
			this.config.prices = { test: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 130,
			});
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			const invoice = billing.createInvoice('test', 10);
			expect(account.availableBalance).to.be.equals(130);
			account.freezeMoney(invoice);
			expect(account.availableBalance).to.be.equals(10);
		});
		
		it('invoice can be rollbacked', () => {
			this.config.prices = { test: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 130,
			});
			user.freezeBalance = 120;
			
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			const invoice = billing.createInvoice('test', 10);
			account.rollBackInvoice(invoice);
			expect(account.availableBalance).to.be.equals(130);
		});
		
		it('invoice can be committed', () => {
			this.config.prices = { test: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 130,
			});
			user.freezeBalance = 120;
			
			const billing = new Billing(this.config);
			const account = new BillingAccount(user, this.config, billing);
			const invoice = billing.createInvoice('test', 10);
			account.commitInvoice(invoice);
			expect(account.availableBalance).to.be.equals(10);
		});
	});
});
