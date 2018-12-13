import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';

import mongoose from '../../../../lib/mongoose';
import BaseTaskError from '../../api/errors/tasks/BaseTaskError';
import Billing from '../../billing/Billing';
import BillingAccount from '../../billing/BillingAccount';
import CommentsCheckTask from '../../tasks/CommentsCheckTask';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('CommentsCheckTask', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should throw error if check failed and it was last service', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest'],
		};

		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const parentTask = mongoose.model('CommentsCommon').createInstance({
			count: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const taskDocument = mongoose.model('CommentsCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call() {
				return {
					comments: 9,
				};
			},
		};

		const task = new CommentsCheckTask({
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
		this.config.commentsTask = { ...this.config.commentsTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const parentTask = mongoose.model('CommentsCommon').createInstance({
			count: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const taskDocument = mongoose.model('CommentsCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call() {
				return {
					comments: 11,
				};
			},
		};

		const task = new CommentsCheckTask({
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

	it('should not finish task if error happens', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest'],
		};

		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const parentTask = mongoose.model('CommentsCommon').createInstance({
			count: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const taskDocument = mongoose.model('CommentsCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call() {
				throw new Error('some error');
			},
		};

		const task = new CommentsCheckTask({
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});
		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.waiting);
		expect(taskDocument.parentTask._error).to.be.null;
	});

	it('should handle second task if 1st finished with unsuccessful check', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest', 'z1y1x1'],
		};
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});
		await user.save();
		const parentTask = mongoose.model('CommentsCommon').createInstance({
			count: 10,
			postLink: 'tetsLink',
			user,
		});

		const taskDocument = mongoose.model('CommentsCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call(request) {
				if (request.method === 'checkComments') {
					return {
						comments: 9,
					};
				}

				return true;
			},
		};

		const task = new CommentsCheckTask({
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});

		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;

		const commentsTask = await mongoose
			.model('CommentsTask')
			.find({ parentTask: parentTask._id, service: 'z1y1x1' })
			.findOne()
			.lean()
			.exec();

		expect(commentsTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.checking);
		expect(taskDocument.parentTask._error).to.be.null;
	});

	it('should commit transaction if task complete successful', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest'],
			commentsToCheck: 0.3,
		};

		this.config.prices = {
			...this.config.prices,
			comment: 10,
		};

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1100,
		});

		const parentTask = mongoose.model('CommentsCommon').createInstance({
			count: 20,
			postLink: 'tetsLink',
			user,
		});

		const taskDocument = mongoose.model('CommentsCheckTask').createInstance({
			count: 6,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		await Promise.all([parentTask.save(), taskDocument.save()]);

		const rpcClient = {
			call() {
				return {
					comments: 7,
				};
			},
		};

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const task = new CommentsCheckTask({
			billing,
			account,
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});

		const count = taskDocument.count / 0.3;
		await account.freezeMoney(parentTask);
		// eslint-disable-next-line no-mixed-operators
		const expectedBalance = 1100 - count * 10;
		expect(account.availableBalance).to.be.equals(expectedBalance);

		const promise = task.handle();
		await expect(promise).to.eventually.fulfilled;

		const invoice = await mongoose.model('TaskInvoice').findOne({ task: parentTask.id });
		expect(invoice.status).to.be.equals(mongoose.model('TaskInvoice').status.paid);

		expect(account.availableBalance).to.be.equals(expectedBalance);
		expect(user.balance).to.be.equals(expectedBalance);
		expect(user.freezeBalance).to.be.equals(0);

		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask._error).to.be.null;
	});

	it('should rollback transaction if last task complete without success', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest'],
			commentsToCheck: 0.3,
		};

		this.config.prices = {
			...this.config.prices,
			comment: 10,
		};

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1100,
		});

		const parentTask = mongoose.model('CommentsCommon').createInstance({
			count: 40,
			postLink: 'tetsLink',
			user,
		});

		const taskDocument = mongoose.model('CommentsCheckTask').createInstance({
			count: 12,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call() {
				return {
					comments: 11,
				};
			},
		};

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const task = new CommentsCheckTask({
			billing,
			account,
			rpcClient,
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});

		const count = taskDocument.count / 0.3;
		await account.freezeMoney(parentTask);
		// eslint-disable-next-line no-mixed-operators
		const expectedBalance = 1100 - count * 10;
		expect(account.availableBalance).to.be.equals(expectedBalance);

		const promise = task.handle();
		await expect(promise).to.eventually.rejectedWith(BaseTaskError);

		const invoice = await mongoose.model('TaskInvoice').findOne({ task: parentTask.id });
		expect(invoice.status).to.be.equals(mongoose.model('TaskInvoice').status.inactive);

		expect(account.availableBalance).to.be.equals(1100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(0);

		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.parentTask._error).to.be.not.null;
	});
});
