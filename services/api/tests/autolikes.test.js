import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';

import mongoose from '../../../lib/mongoose';
import Billing from '../billing/Billing';
import AutoLikesTask from '../tasks/AutolikesTask';
import { NotEnoughBalanceForComments, NotEnoughBalanceForLikes } from '../api/errors/tasks';
import BillingAccount from '../billing/BillingAccount';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('AutolikesTask', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should skip if user has no target groups', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		await group.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 50,
			repostsCount: 30,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should skip if error happens during rpc call for get lastPost', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		const rpcClient = {
			call() {
				rpcCalledTimes += 1;
				throw new Error('fail');
			},
		};
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 50,
			repostsCount: 30,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(1);
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should skip if postLink is the same as lastHandled link', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		const rpcClient = {
			call() {
				rpcCalledTimes += 1;
				return { postId: 123 };
			},
		};
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 50,
			repostsCount: 30,
			group,
			user,
		});

		taskDocument.lastPostLink = mongoose.model('Group').getPostLinkById(123);
		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(1);
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should skip if there is no mentionId', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		const rpcClient = {
			call() {
				rpcCalledTimes += 1;
				return { postId: 123 };
			},
		};
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 50,
			repostsCount: 30,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(1);
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should skip if no one of target groups are equals to response', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		const rpcClient = {
			call() {
				rpcCalledTimes += 1;
				return { postId: 123, mentionId: 'tetId3' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 50,
			repostsCount: 30,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(1);
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should create likesTask if task has field contentPosts', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}
				return { postId: 123 };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 0,
			repostsCount: 0,
			contentPosts: true,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(2);
		await expect(setLikesCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should create likesTask if task has field contentPosts and has no target groups', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });

		await group.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		let rpcCalledTimes = 0;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}
				return { postId: 123 };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 0,
			repostsCount: 0,
			contentPosts: true,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(2);
		await expect(setLikesCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should not create likesTask if task has field contentPosts and there is any link in text', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}
				return { postId: 123, link: 'asd' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 0,
			repostsCount: 0,
			contentPosts: true,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(setLikesCalled).to.be.false;
		await expect(rpcCalledTimes).to.be.equals(1);
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should not create likesTask if task has field contentPosts and there is mentionId in text', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}
				return { postId: 123, mentionId: 'asd' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 0,
			repostsCount: 0,
			contentPosts: true,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(setLikesCalled).to.be.false;
		await expect(rpcCalledTimes).to.be.equals(1);
		expect(taskDocument.subTasks.length).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should create likesTask if one of target groups is in post', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}
				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 0,
			repostsCount: 0,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(2);
		await expect(setLikesCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should create commentsTask if one of target groups is in post', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setCommonetsCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setComments_/.test(request.method)) {
					setCommonetsCalled = true;
				}
				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 0,
			commentsCount: 100,
			repostsCount: 0,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(2);
		await expect(setCommonetsCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should create repostsTask if one of target groups is in post', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setRepostsCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setReposts_/.test(request.method)) {
					setRepostsCalled = true;
				}
				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 0,
			commentsCount: 0,
			repostsCount: 100,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(2);
		await expect(setRepostsCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should create repostsTask, likesTask, commentsTask if one of target groups is in post', async () => {
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setRepostsCalled = false;
		let setCommentsCalled = false;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;
				if (/^setReposts_/.test(request.method)) {
					setRepostsCalled = true;
				}

				if (/^setComments_/.test(request.method)) {
					setCommentsCalled = true;
				}

				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}

				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 100,
			commentsCount: 100,
			repostsCount: 100,
			group,
			user,
		});

		const task = new AutoLikesTask({
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		await expect(rpcCalledTimes).to.be.equals(4);
		await expect(setRepostsCalled).to.be.true;
		await expect(setCommentsCalled).to.be.true;
		await expect(setLikesCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(3);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should complete one task and throw error if user has money only for one', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 11,
		};

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1000,
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setCommentsCalled = false;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;

				if (/^setComments_/.test(request.method)) {
					setCommentsCalled = true;
				}

				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}

				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 90,
			commentsCount: 100,
			repostsCount: 0,
			group,
			user,
		});

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const task = new AutoLikesTask({
			billing,
			account,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		let errors = [];
		await promise.catch(_errors => {
			errors = _errors;
		});

		expect(errors.length).to.be.equals(1);
		const instanceOfCondition =
			errors[0] instanceof NotEnoughBalanceForLikes ||
			errors[0] instanceof NotEnoughBalanceForComments;

		expect(instanceOfCondition).to.be.true;
		expect(rpcCalledTimes).to.be.equals(2);
		//eslint-disable-next-line no-mixed-operators
		const condition =
			(setCommentsCalled && !setLikesCalled) || (!setCommentsCalled && setLikesCalled);
		expect(condition).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(2);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.skipped);
	});

	it('should commit invoices and complete tasks if user has enough money', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 11,
		};
		this.config.likesTask.serviceOrder = ['likest'];

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 2000,
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setCommentsCalled = false;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;

				if (/^setComments_/.test(request.method)) {
					setCommentsCalled = true;
				}

				if (/^setLikes_/.test(request.method)) {
					setLikesCalled = true;
				}

				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 90,
			commentsCount: 100,
			repostsCount: 0,
			group,
			user,
		});

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const task = new AutoLikesTask({
			billing,
			account,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		let errors = [];
		await promise.catch(_errors => {
			errors = _errors;
		});

		const subTasks = await mongoose
			.model('Task')
			.find({ _id: { $in: taskDocument.subTasks.map(t => t._id) } })
			.lean()
			.exec();

		const likesCommonTask = subTasks.filter(sTask => sTask.__t === 'LikesCommon')[0];
		const likesTask = await mongoose.model('LikesTask').findOne({
			_id: { $in: likesCommonTask.subTasks },
		});

		const invoice = await mongoose.model('TaskInvoice').findOne({
			task: likesTask._id,
		});

		expect(invoice.status).to.be.equals(mongoose.model('Invoice').status.paid);

		const subTasksHasNoErrors = subTasks.every(_task => !_task._error);

		expect(subTasksHasNoErrors).to.be.true;
		expect(errors.length).to.be.equals(0);
		expect(rpcCalledTimes).to.be.equals(3);
		expect(setCommentsCalled).to.be.true;
		expect(setLikesCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(2);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('Should take money for 100 likes if task complete from LikePro service', async () => {
		this.config.likesTask = {
			...this.config.likesTask,
			serviceOrder: ['likePro'],
		};

		this.config.prices = {
			...this.config.prices,
			like: 10,
		};

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const targetGroup = mongoose.model('Group').createInstance({ id: 'testId2' });

		await group.save();
		await targetGroup.save();
		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 2000,
		});

		user.targetGroups.push(targetGroup);

		let rpcCalledTimes = 0;
		let setLikesCalled = false;
		const rpcClient = {
			call(request) {
				rpcCalledTimes += 1;

				if (/^setLikes_/.test(request.method)) {
					expect(request.args.count).to.be.equals(100);
					setLikesCalled = true;
				}

				return { postId: 123, mentionId: 'clubtestId2' };
			},
		};

		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 70,
			commentsCount: 0,
			repostsCount: 0,
			group,
			user,
		});

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const task = new AutoLikesTask({
			billing,
			account,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			rpcClient,
		});

		const promise = task.handle();
		let errors = [];
		await promise.catch(_errors => {
			errors = _errors;
		});

		const subTasks = await mongoose
			.model('Task')
			.find({ _id: { $in: taskDocument.subTasks.map(t => t._id) } })
			.lean()
			.exec();

		const invoice = await mongoose.model('TaskInvoice').findOne({
			user: user.id,
			status: mongoose.model('Invoice').status.active,
		});
		const likesTask = await mongoose.model('LikesTask').findOne({ parentTask: invoice.task });
		expect(invoice.amount).to.be.equals(1000);
		expect(user.balance).to.be.equals(2000);
		expect(user.freezeBalance).to.be.equals(1000);
		expect(account.availableBalance).to.be.equals(1000);
		expect(likesTask.count).to.be.equals(100);

		const subTasksHasNoErrors = subTasks.every(_task => !_task._error);

		expect(subTasksHasNoErrors).to.be.true;
		expect(errors.length).to.be.equals(0);
		expect(rpcCalledTimes).to.be.equals(2);
		expect(setLikesCalled).to.be.true;
		expect(taskDocument.subTasks.length).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});
});
