import { expect } from 'chai';
import config   from 'config';
import _        from 'lodash';

import mongoose           from '../../../../lib/mongoose';
import BaseTaskError      from '../../api/errors/tasks/BaseTaskError';
import Billing            from '../../billing/Billing';
import RepostsCommonTask  from '../../tasks/RepostsCommonTask';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('RepostsCommon', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	it('should throw error if cant setReposts with 1 service', async () => {
		this.config.repostsTask = { ...this.config.repostsTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const taskDocument = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			user,
		});
		const rpcClient = {
			call() {
				throw new Error('fail');
			},
		};
		
		const commonTask = new RepostsCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});
		
		const promise = commonTask.handle();
		
		await expect(promise).to.be.rejectedWith(BaseTaskError);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument._error).to.be.not.null;
	});
	
	it('should not throw error if cant setReposts with first service but can with second', async () => {
		this.config.repostsTask = { ...this.config.repostsTask, serviceOrder: ['likest', 'z1y1x1'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const taskDocument = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 10,
			postLink    : 'tetsLink',
			status      : mongoose.model('Task').status.pending,
			user,
		});
		
		const rpcClient = {
			call(request) {
				if (request.method === 'setReposts_z1y1x1') {
					return true;
				}
				
				throw new Error('fail');
			},
		};
		
		const commonTask = new RepostsCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});
		
		
		const promise = commonTask.handle();
		await expect(promise).to.eventually.fulfilled;
		
		const repostsTaskDocument = await mongoose
			.model('RepostsTask')
			.findOne({ parentTask: taskDocument._id, service: 'z1y1x1' })
			.lean()
			.exec();
		
		expect(taskDocument._error).to.be.null;
		expect(repostsTaskDocument._error).to.be.null;
		expect(repostsTaskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.checking);
	});
	
	it('should rollback transaction if final task complete with error', async () => {
		this.config.repostsTask = {
			...this.config.repostsTask,
			serviceOrder: ['likest'],
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
		
		const taskDocument = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 100,
			postLink    : 'tetsLink',
			status      : mongoose.model('Task').status.pending,
			user,
		});
		
		const rpcClient = {
			async call() {
				throw new Error('fail');
			},
		};
		
		const billing = new Billing(this.config, loggerMock);
		/**
		 * @type {BillingAccount}
		 */
		const account = billing.createAccount(user);
		account.freezeMoney(billing.createInvoice(
			Billing.types.repost,
			taskDocument.repostsCount,
		));
		expect(account.availableBalance).to.be.equals(100);
		const commonTask = new RepostsCommonTask({
			billing,
			account,
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});
		
		const promise = commonTask.handle();
		await expect(promise).to.eventually.rejectedWith(BaseTaskError);
		
		expect(account.availableBalance).to.be.equals(1100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(0);
	});
	
	it('should not rollback transaction if final task complete successful', async () => {
		this.config.repostsTask = {
			...this.config.repostsTask,
			serviceOrder: ['likest'],
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
		
		const taskDocument = mongoose.model('RepostsCommon').createInstance({
			repostsCount: 100,
			postLink    : 'tetsLink',
			status      : mongoose.model('Task').status.pending,
			user,
		});
		
		const rpcClient = {
			async call() {
				return true;
			},
		};
		
		const billing = new Billing(this.config, loggerMock);
		/**
		 * @type {BillingAccount}
		 */
		const account = billing.createAccount(user);
		account.freezeMoney(billing.createInvoice(
			Billing.types.repost,
			taskDocument.repostsCount,
		));
		expect(account.availableBalance).to.be.equals(100);
		const commonTask = new RepostsCommonTask({
			billing,
			account,
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});
		
		const promise = commonTask.handle();
		await expect(promise).to.eventually.fulfilled;
		
		expect(account.availableBalance).to.be.equals(100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(1000);
	});
});
