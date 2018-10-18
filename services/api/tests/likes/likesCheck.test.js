import { expect } from 'chai';
import config   from 'config';
import _        from 'lodash';

import mongoose       from '../../../../lib/mongoose';
import LikesCheckTask from '../../tasks/LikesCheckTask';
import BaseTaskError  from '../../api/errors/tasks/BaseTaskError';
import Billing        from '../../billing/Billing';
import BillingAccount from '../../billing/BillingAccount';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('LikesCheckTask', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	it('should throw error if check failed and it was last service', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const parentTask = mongoose.model('LikesCommon').createInstance({
			likesCount: 100,
			postLink  : 'tetsLink',
			status    : mongoose.model('Task').status.pending,
			user,
		});
		
		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			likesCount  : 10,
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
		
		const task = new LikesCheckTask({
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
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const parentTask = mongoose.model('LikesCommon').createInstance({
			likesCount: 100,
			postLink  : 'tetsLink',
			status    : mongoose.model('Task').status.pending,
			user,
		});
		
		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			likesCount  : 10,
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
		
		const task = new LikesCheckTask({
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
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest', 'z1y1x1'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		await user.save();
		
		const parentTask = mongoose.model('LikesCommon').createInstance({
			likesCount: 10,
			postLink  : 'tetsLink',
			user,
		});
		
		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			likesCount  : 10,
			postLink    : 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});
		
		const rpcClient = {
			call(request) {
				if (request.method === 'checkLikes') {
					throw new Error('fail');
				}
				
				return true;
			},
		};
		
		const task = new LikesCheckTask({
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		
		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;
		
		const likesTask = await mongoose
			.model('LikesTask')
			.find({ parentTask: parentTask._id, service: 'z1y1x1' })
			.findOne()
			.lean()
			.exec();
		
		expect(likesTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.checking);
		expect(taskDocument.parentTask._error).to.be.null;
	});
	
	it('should commit transaction if task complete successful', async () => {
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likest'],
			likesToCheck: 0.3,
		};
		
		this.config.prices = {
			...this.config.prices,
			like: 10,
		};
		
		const user = mongoose.model('AccountUser').createInstance({
			email   : 'test',
			password: 'test',
			balance : 1100,
		});
		
		const parentTask = mongoose.model('LikesCommon').createInstance({
			likesCount: 40,
			postLink  : 'tetsLink',
			user,
		});
		
		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			likesCount  : 12,
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
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const task = new LikesCheckTask({
			billing,
			account,
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		
		const likesCount =  taskDocument.likesCount / 0.3;
		await account.freezeMoney(parentTask);
		// eslint-disable-next-line no-mixed-operators
		const expectedBalance = 1100 - likesCount * 10;
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
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likest'],
			likesToCheck: 0.3,
		};
		
		this.config.prices = {
			...this.config.prices,
			like: 10,
		};
		
		const user = mongoose.model('AccountUser').createInstance({
			email   : 'test',
			password: 'test',
			balance : 1100,
		});
		
		const parentTask = mongoose.model('LikesCommon').createInstance({
			likesCount: 40,
			postLink  : 'tetsLink',
			user,
		});
		
		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			likesCount  : 12,
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
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const task = new LikesCheckTask({
			billing,
			account,
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		
		const likesCount = taskDocument.likesCount / 0.3;
		await account.freezeMoney(parentTask);
		// eslint-disable-next-line no-mixed-operators
		const expectedBalance = 1100 - likesCount * 10;
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
