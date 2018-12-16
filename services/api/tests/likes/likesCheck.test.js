import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';

import mongoose from '../../../../lib/mongoose';
import LikesCheckTask from '../../tasks/LikesCheckTask';
import BaseTaskError from '../../api/errors/tasks/BaseTaskError';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('LikesCheckTask', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should throw error if check failed and it was last service', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const parentTask = mongoose.model('LikesCommon').createInstance({
			count: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call() {
				return {
					likes: 9,
				};
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
			email: 'test',
			password: 'test',
		});

		const parentTask = mongoose.model('LikesCommon').createInstance({
			count: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call() {
				return {
					likes: 11,
				};
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

	it('should not finish task if error happens', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const parentTask = mongoose.model('LikesCommon').createInstance({
			count: 100,
			postLink: 'tetsLink',
			status: mongoose.model('Task').status.pending,
			user,
		});

		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
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

		const task = new LikesCheckTask({
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

	it('should handle second task if 1st finished with error', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest', 'z1y1x1'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});
		await user.save();

		const parentTask = mongoose.model('LikesCommon').createInstance({
			count: 10,
			postLink: 'tetsLink',
			user,
		});

		const taskDocument = mongoose.model('LikesCheckTask').createInstance({
			count: 10,
			postLink: 'tetsLink',
			serviceIndex: 0,
			parentTask,
			user,
		});

		const rpcClient = {
			call(request) {
				if (request.method === 'checkLikes') {
					return {
						likes: 9,
					};
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
});
