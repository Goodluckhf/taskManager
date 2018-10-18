import _                    from 'lodash';
import config               from 'config';
import { expect }           from 'chai';
import mongoose             from '../../../../lib/mongoose';
import Billing              from '../../billing/Billing';
import BillingAccount       from '../../billing/BillingAccount';
import PremiumAccount       from '../../billing/PremiumAccount';
import { NotEnoughBalance } from '../../api/errors/tasks';

const loggerMock = { info() {}, error() {}, warn() {} };

describe('Billing', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	it('should calculate price for likestTask', () => {
		this.config.prices = { like: 123 };
		const billing      = new Billing(this.config, loggerMock);
		
		const task = mongoose.model('LikesTask').createInstance({
			postLink  : 'test',
			likesCount: 200,
		});
		
		expect(billing.calculatePrice(task)).to.be.equals(200 * 123);
	});
	
	it('should calculate price for commentsTask', () => {
		this.config.prices = { comment: 321 };
		const billing      = new Billing(this.config, loggerMock);
		
		const task = mongoose.model('CommentsTask').createInstance({
			postLink     : 'test',
			commentsCount: 200,
		});
		
		expect(billing.calculatePrice(task)).to.be.equals(200 * 321);
	});
	
	it('should calculate price for repostsTask', () => {
		this.config.prices = { repost: 223 };
		const billing      = new Billing(this.config, loggerMock);
		
		const task = mongoose.model('RepostsTask').createInstance({
			postLink    : 'test',
			repostsCount: 200,
		});
		
		expect(billing.calculatePrice(task)).to.be.equals(200 * 223);
	});
	
	it('should create billing user if user type is billing', () => {
		const user = mongoose.model('AccountUser').createInstance({ password: 'asdasd' });
		const billing = new Billing(this.config, loggerMock);
		const account = billing.createAccount(user);
		expect(account).to.be.instanceOf(BillingAccount);
	});
	
	it('should create premium user if user type is premium', () => {
		const user = mongoose.model('PremiumUser').createInstance({ password: 'asdasd' });
		const billing = new Billing(this.config, loggerMock);
		const account = billing.createAccount(user);
		expect(account).to.be.instanceOf(PremiumAccount);
	});
	
	it('getTotalPrice should correct calculate price', () => {
		this.config.prices = { like: 32, repost: 43, comment: 23 };
		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({ email: 'test', password: '123' });
		const repostTask   = mongoose.model('RepostsTask').createInstance({ repostsCount: 123 });
		const likesTask    = mongoose.model('LikesTask').createInstance({ likesCount: 223 });
		const commentsTask = mongoose.model('CommentsTask').createInstance({ commentsCount: 321 });
		const invoices = [
			billing.createTaskInvoice(repostTask, user),
			billing.createTaskInvoice(likesTask, user),
			billing.createTaskInvoice(commentsTask, user),
		];
		
		// eslint-disable-next-line no-mixed-operators
		const expectedPrice = 32 * 223 + 43 * 123 + 23 * 321;
		expect(billing.getTotalPrice(invoices)).to.be.equals(expectedPrice);
	});
	
	describe('BillingAccount', () => {
		it('new billing user should has empty balance', () => {
			const user = mongoose.model('AccountUser').createInstance({ password: 'asdasd' });
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			expect(account.availableBalance).to.be.equals(0);
		});
		
		it('should throw error if invoice is more then available balance', () => {
			this.config.prices = { like: 12 };
			
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 100,
			});
			const task = mongoose.model('LikesTask').createInstance({ likesCount: 100 });
			
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			const invoice = billing.createTaskInvoice(task, user);
			expect(account.canPay.bind(account, invoice)).to.throw(NotEnoughBalance);
		});
		
		it('should throw error trying freeze balance with less balance', async () => {
			this.config.prices = { like: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				password: 'asdasd',
				balance : 100,
			});
			const task = mongoose.model('LikesTask').createInstance({
				likesCount: 100,
				user,
			});
			
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			const promise = account.freezeMoney(task);
			
			await expect(promise).to.be.rejectedWith(NotEnoughBalance);
		});
		
		it('should freeze money', async () => {
			this.config.prices = { like: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				email   : 'test',
				password: 'asdasd',
				balance : 130,
			});
			
			const task = mongoose.model('LikesTask').createInstance({
				likesCount: 10,
				user,
			});
			
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			const promise = account.freezeMoney(task);
			await expect(promise).to.be.fulfilled;
			expect(account.user.freezeBalance).to.be.equals(10 * 12);
			expect(account.user.balance).to.be.equals(130);
			expect(account.availableBalance).to.be.equals(130 - 120);
		});
		
		it('should create invoice after freeze', async () => {
			this.config.prices = { like: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				email   : 'test',
				password: 'asdasd',
				balance : 130,
			});
			
			const task = mongoose.model('LikesTask').createInstance({
				likesCount: 10,
				user,
			});
			
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			const promise = account.freezeMoney(task);
			await expect(promise).to.be.fulfilled;
			const invoice = await mongoose.model('TaskInvoice').findOne({ task: task.id });
			expect(invoice).to.be.not.null;
			expect(invoice.amount).to.be.equals(10 * 12);
		});
		
		it('invoice can be rollbacked', async () => {
			this.config.prices = { like: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				email   : 'test',
				password: 'asdasd',
				balance : 130,
			});
			const task = mongoose.model('LikesTask').createInstance({
				likesCount: 10,
				postLink  : 'test',
				service   : 'likest',
			});
			user.freezeBalance = 120;
			const invoice = mongoose.model('TaskInvoice').createInstance({
				amount: 120,
				user,
				task,
			});
			await Promise.all([
				invoice.save(),
				task.save(),
				user.save(),
			]);
			
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			await account.rollBack(task);
			expect(account.availableBalance).to.be.equals(130);
			expect(user.balance).to.be.equals(130);
			expect(user.freezeBalance).to.be.equals(0);
		});
		
		it('invoice can be committed', async () => {
			this.config.prices = { test: 12 };
			const user = mongoose.model('AccountUser').createInstance({
				email   : 'test',
				password: 'asdasd',
				balance : 130,
			});
			user.freezeBalance = 120;
			const task = mongoose.model('LikesTask').createInstance({
				likesCount: 10,
				postLink  : 'test',
				service   : 'likest',
			});
			const invoice = mongoose.model('TaskInvoice').createInstance({
				amount: 120,
				user,
				task,
			});
			await Promise.all([
				invoice.save(),
				task.save(),
				user.save(),
			]);
			
			const billing = new Billing(this.config, loggerMock);
			const account = new BillingAccount(user, this.config, billing, loggerMock);
			await account.commit(task);
			expect(account.availableBalance).to.be.equals(10);
			expect(user.freezeBalance).to.be.equals(0);
			expect(user.balance).to.be.equals(10);
		});
	});
	
	it('Should create invoice with random string note', () => {
		const invoice1 = mongoose.model('TopUpInvoice').createInstance({});
		const invoice2 = mongoose.model('TopUpInvoice').createInstance({});
		expect(invoice1.note).to.be.not.equals(invoice2.note);
	});
});
