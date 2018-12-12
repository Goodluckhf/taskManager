import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';

import mongoose from '../../../../lib/mongoose';
import BaseTaskError from '../../api/errors/tasks/BaseTaskError';
import Billing from '../../billing/Billing';
import CommentsCommonTask from '../../tasks/CommentsCommonTask';
import BillingAccount from '../../billing/BillingAccount';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('CommentsCommon', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should throw error if cant setComments with 1 service', async () => {
		this.config.commentsTask = { ...this.config.commentsTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const taskDocument = mongoose.model('CommentsCommon').createInstance({
			commentsCount: 10,
			postLink: 'tetsLink',
			user,
		});

		const rpcClient = {
			call() {
				throw new Error('fail');
			},
		};

		const commonTask = new CommentsCommonTask({
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

	it('should not throw error if cant setComments with first service but can with second', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest', 'z1y1x1'],
		};
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const taskDocument = mongoose.model('CommentsCommon').createInstance({
			commentsCount: 10,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const rpcClient = {
			call(request) {
				if (request.method === 'setComments_z1y1x1') {
					return true;
				}

				throw new Error('fail');
			},
		};

		const commonTask = new CommentsCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = commonTask.handle();
		await expect(promise).to.eventually.fulfilled;

		const commentsTaskDocument = await mongoose
			.model('CommentsTask')
			.findOne({ parentTask: taskDocument._id, service: 'z1y1x1' })
			.lean()
			.exec();

		expect(taskDocument._error).to.be.null;
		expect(commentsTaskDocument._error).to.be.null;
		expect(commentsTaskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.checking);
	});

	it('should rollback transaction if final task complete with error', async () => {
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest'],
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

		const taskDocument = mongoose.model('CommentsCommon').createInstance({
			commentsCount: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const rpcClient = {
			async call() {
				throw new Error('fail');
			},
		};

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		await account.freezeMoney(taskDocument);
		expect(account.availableBalance).to.be.equals(100);
		const commonTask = new CommentsCommonTask({
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
		this.config.commentsTask = {
			...this.config.commentsTask,
			serviceOrder: ['likest'],
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

		const taskDocument = mongoose.model('CommentsCommon').createInstance({
			commentsCount: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const rpcClient = {
			async call() {
				return true;
			},
		};

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		await account.freezeMoney(taskDocument);
		expect(account.availableBalance).to.be.equals(100);
		const commonTask = new CommentsCommonTask({
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
