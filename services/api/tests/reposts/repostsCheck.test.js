import { expect } from 'chai';
import config   from 'config';
import _        from 'lodash';

import mongoose          from '../../../../lib/mongoose';
import BaseTaskError     from '../../api/errors/tasks/BaseTaskError';
import Billing           from '../../billing/Billing';
import RepostsCheckTask  from '../../tasks/RepostsCheckTask';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('RepostsCheckTask', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	it('should throw error if check failed and it was last service', async () => {
		this.config.repostsTask = {
			...this.config.repostsTask,
			serviceOrder: ['likest'],
		};
		
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const parentTask = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 100,
			postLink    : 'tetsLink',
			status      : mongoose.model('Task').status.pending,
			user,
		});
		
		const taskDocument = mongoose.model('RepostsCheckTask').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});
		
		const rpcClient = {
			call() {
				throw new Error('fail');
			},
		};
		
		const task = new RepostsCheckTask({
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		const promise = task.handle();
		await expect(promise).to.eventually.rejectedWith(BaseTaskError);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask._error).to.be.not.null;
	});
	
	it('should set finished status to parentTask if complete successful', async () => {
		this.config.repostsTask = { ...this.config.repostsTask, serviceOrder: ['likest'] };
		
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const parentTask = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 100,
			postLink    : 'tetsLink',
			status      : mongoose.model('Task').status.pending,
			user,
		});
		
		const taskDocument = mongoose.model('RepostsCheckTask').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});
		
		const rpcClient = {
			call() {
				return true;
			},
		};
		
		const task = new RepostsCheckTask({
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask._error).to.be.null;
	});
	
	it('should handle second task if 1st finished with error', async () => {
		this.config.repostsTask = { ...this.config.repostsTask, serviceOrder: ['likest', 'z1y1x1'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		await user.save();
		
		const parentTask = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			user,
		});
		
		const taskDocument = mongoose.model('RepostsCheckTask').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});
		
		const rpcClient = {
			call(request) {
				if (request.method === 'checkReposts') {
					throw new Error('fail');
				}
				
				return true;
			},
		};
		
		const task = new RepostsCheckTask({
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		
		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;
		
		const repostsTask = await mongoose
			.model('RepostsTask')
			.find({ parentTask: parentTask._id, service: 'z1y1x1' })
			.findOne()
			.lean()
			.exec();
		
		expect(repostsTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.checking);
		expect(taskDocument.parentTask._error).to.be.null;
	});
	
	it('should commit transaction if task complete successful', async () => {
		this.config.repostsTask = {
			...this.config.repostsTask,
			serviceOrder  : ['likest'],
			repostsToCheck: 0.3,
		};
		
		this.config.prices = {
			...this.config.prices,
			repost: 10,
		};
		
		const user = mongoose.model('AccountUser').createInstance({
			email   : 'test',
			password: 'test',
			balance : 1100,
		});
		
		const parentTask = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			user,
		});
		
		const taskDocument = mongoose.model('RepostsCheckTask').createInstance({
			repostsCount: 12,
			postLink    : 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});
		
		const rpcClient = {
			call() {
				return true;
			},
		};
		
		
		const billing = new Billing(this.config, loggerMock);
		/**
		 * @type {BillingAccount}
		 */
		const account = billing.createAccount(user);
		const task = new RepostsCheckTask({
			billing,
			account,
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		// eslint-disable-next-line no-mixed-operators
		const repostsCount = 1 / 0.3 * taskDocument.repostsCount;
		account.freezeMoney(billing.createInvoice(
			Billing.types.repost,
			repostsCount,
		));
		// eslint-disable-next-line no-mixed-operators
		const expectedBalance = 1100 - repostsCount * 10;
		expect(account.availableBalance).to.be.equals(expectedBalance);
		
		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;
		
		expect(account.availableBalance).to.be.equals(expectedBalance);
		expect(user.balance).to.be.equals(expectedBalance);
		expect(user.freezeBalance).to.be.equals(0);
		
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask._error).to.be.null;
	});
	
	it('should rollback transaction if last task complete with error', async () => {
		this.config.repostsTask = {
			...this.config.repostsTask,
			serviceOrder  : ['likest'],
			repostsToCheck: 0.3,
		};
		
		this.config.prices = {
			...this.config.prices,
			repost: 10,
		};
		
		const user = mongoose.model('AccountUser').createInstance({
			email   : 'test',
			password: 'test',
			balance : 1100,
		});
		
		const parentTask = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			user,
		});
		
		const taskDocument = mongoose.model('RepostsCheckTask').createInstance({
			repostsCount: 12,
			postLink    : 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});
		
		const rpcClient = {
			call() {
				throw new Error('failed');
			},
		};
		
		
		const billing = new Billing(this.config, loggerMock);
		/**
		 * @type {BillingAccount}
		 */
		const account = billing.createAccount(user);
		const task = new RepostsCheckTask({
			billing,
			account,
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		// eslint-disable-next-line no-mixed-operators
		const repostsCount = 1 / 0.3 * taskDocument.repostsCount;
		account.freezeMoney(billing.createInvoice(
			Billing.types.repost,
			repostsCount,
		));
		// eslint-disable-next-line no-mixed-operators
		const expectedBalance = 1100 - repostsCount * 10;
		expect(account.availableBalance).to.be.equals(expectedBalance);
		
		const promise = task.handle();
		await expect(promise).to.eventually.rejectedWith(BaseTaskError);
		
		expect(account.availableBalance).to.be.equals(1100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(0);
		
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask._error).to.be.not.null;
	});
});
