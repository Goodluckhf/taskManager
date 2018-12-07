import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';

import mongoose from '../../../../lib/mongoose';
import LikesCommonTask from '../../tasks/LikesCommonTask';
import BaseTaskError from '../../api/errors/tasks/BaseTaskError';
import Billing from '../../billing/Billing';
import BillingAccount from '../../billing/BillingAccount';
import { NotEnoughBalanceForLikes } from '../../api/errors/tasks';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('LikesCommonTask', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should throw error if cant setLikes with 1 service', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 10,
			postLink: 'tetsLink',
			user,
		});
		const rpcClient = {
			call() {
				throw new Error('fail');
			},
		};

		const likesCommonTask = new LikesCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = likesCommonTask.handle();

		await expect(promise).to.be.rejectedWith(BaseTaskError);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument._error).to.be.not.null;
	});

	it('should not throw error if cant setLikes with first service but can with second', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest', 'z1y1x1'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 10,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const rpcClient = {
			call(request) {
				if (request.method === 'setLikes_z1y1x1') {
					return true;
				}

				throw new Error('fail');
			},
		};

		const likesCommonTask = new LikesCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = likesCommonTask.handle();
		await expect(promise).to.eventually.fulfilled;

		const likesTaskDocument = await mongoose
			.model('LikesTask')
			.findOne({ parentTask: taskDocument._id, service: 'z1y1x1' })
			.lean()
			.exec();

		expect(taskDocument._error).to.be.null;
		expect(likesTaskDocument._error).to.be.null;
		expect(likesTaskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.checking);
	});

	it('should rollback transaction if final task complete with error', async () => {
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likest'],
		};

		this.config.prices = {
			...this.config.prices,
			like: 10,
		};

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1100,
		});

		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 100,
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
		const likesCommonTask = new LikesCommonTask({
			billing,
			account,
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = likesCommonTask.handle();
		await expect(promise).to.eventually.rejectedWith(BaseTaskError);

		expect(account.availableBalance).to.be.equals(1100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(0);
	});

	it('should not rollback transaction if final task complete successful', async () => {
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likest'],
		};

		this.config.prices = {
			...this.config.prices,
			like: 10,
		};

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1100,
		});

		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 100,
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
		account.freezeMoney(taskDocument);
		expect(account.availableBalance).to.be.equals(100);
		const likesCommonTask = new LikesCommonTask({
			billing,
			account,
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = likesCommonTask.handle();
		await expect(promise).to.eventually.fulfilled;

		expect(account.availableBalance).to.be.equals(100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(1000);
	});

	it('should create likesTask for 100 likes if original is less for likePro service', async () => {
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likePro'],
		};

		this.config.prices = {
			...this.config.prices,
			like: 10,
		};

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1100,
		});

		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 90,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const rpcClient = {
			async call(request) {
				expect(request.args.likesCount).to.be.equals(100);
				return true;
			},
		};

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const likesCommonTask = new LikesCommonTask({
			billing,
			account,
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = likesCommonTask.handle();
		await expect(promise).to.eventually.fulfilled;

		expect(account.availableBalance).to.be.equals(100);
		expect(taskDocument.likesCount).to.be.equals(100);
		expect(user.balance).to.be.equals(1100);
		expect(user.freezeBalance).to.be.equals(1000);
	});

	it('should throw error if service is likePro and user has not enough money', async () => {
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likePro'],
		};

		this.config.prices = {
			...this.config.prices,
			like: 10,
		};

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 901,
		});

		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 90,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const rpcClient = {
			async call(request) {
				expect(request.args.likesCount).to.be.equals(100);
				return true;
			},
		};

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const likesCommonTask = new LikesCommonTask({
			billing,
			account,
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});

		const promise = likesCommonTask.handle();
		await expect(promise).to.eventually.rejectedWith(NotEnoughBalanceForLikes);

		expect(account.availableBalance).to.be.equals(901);
		expect(taskDocument.likesCount).to.be.equals(100);
		expect(user.balance).to.be.equals(901);
		expect(user.freezeBalance).to.be.equals(0);
	});
});
