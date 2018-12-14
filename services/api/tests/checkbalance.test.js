import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';
import moment from 'moment';

import mongoose from '../../../lib/mongoose';
import Billing from '../billing/Billing';
import BillingAccount from '../billing/BillingAccount';
import CheckBalanceTask from '../tasks/CheckBalanceTask';
import PremiumAccount from '../billing/PremiumAccount';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('CheckBalanceTask', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should skip if not time to task', async () => {
		let alertSendedCount = 0;
		const alert = {
			sendError() {
				alertSendedCount += 1;
			},
		};
		this.config.checkBalanceTask.interval = 5;

		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const account = new PremiumAccount(user, this.config, {}, loggerMock);

		const taskDocument = mongoose.model('CheckBalanceTask').createInstance({
			user,
			lastHandleAt: moment().subtract(1, 'minutes'),
		});

		const task = new CheckBalanceTask({
			alert,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			account,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(alertSendedCount).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should skip if account is not billing', async () => {
		let alertSendedCount = 0;
		const alert = {
			sendError() {
				alertSendedCount += 1;
			},
		};
		this.config.checkBalanceTask.interval = 5;

		const user = mongoose.model('PremiumUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const account = new PremiumAccount(user, this.config, {}, loggerMock);

		const taskDocument = mongoose.model('CheckBalanceTask').createInstance({
			user,
			lastHandleAt: moment().subtract(6, 'minutes'),
		});

		const task = new CheckBalanceTask({
			alert,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			account,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(alertSendedCount).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should skip if user has not active tasks', async () => {
		let alertSendedCount = 0;
		const alert = {
			sendError() {
				alertSendedCount += 1;
			},
		};
		this.config.checkBalanceTask.interval = 5;

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
		});

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const taskDocument = mongoose.model('CheckBalanceTask').createInstance({
			user,
			lastHandleAt: moment().subtract(6, 'minutes'),
		});

		const task = new CheckBalanceTask({
			alert,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			account,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(alertSendedCount).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should not send alert if balance gt ratio', async () => {
		let alertSendedCount = 0;
		const alert = {
			sendError() {
				alertSendedCount += 1;
			},
		};
		this.config.checkBalanceTask.interval = 5;
		this.config.checkBalanceTask.ratio = 0.7;
		this.config.prices.like = 3;

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1000,
		});
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const likesTaskDocument = mongoose.model('AutoLikesTask').createInstance({
			user,
			group,
			likesCount: 100,
			postLink: 'test',
			commentsCount: 0,
			repostsCount: 0,
		});

		await Promise.all([group.save(), user.save(), likesTaskDocument.save()]);

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const taskDocument = mongoose.model('CheckBalanceTask').createInstance({
			user,
			lastHandleAt: moment().subtract(6, 'minutes'),
		});

		const task = new CheckBalanceTask({
			alert,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			account,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(alertSendedCount).to.be.equals(0);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should not throw error if some error happened', async () => {
		let alertSendedCount = 0;
		const alert = {
			sendError() {
				alertSendedCount += 1;
				throw new Error('fail');
			},
		};
		this.config.checkBalanceTask.interval = 5;
		this.config.checkBalanceTask.ratio = 0.7;
		this.config.prices.like = 3;
		this.config.prices.comment = 3;
		this.config.prices.repost = 3;

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1000,
		});
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const likesTaskDocument = mongoose.model('AutoLikesTask').createInstance({
			user,
			group,
			likesCount: 250,
			postLink: 'test',
			commentsCount: 0,
			repostsCount: 0,
		});

		await Promise.all([group.save(), user.save(), likesTaskDocument.save()]);

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const taskDocument = mongoose.model('CheckBalanceTask').createInstance({
			user,
			lastHandleAt: moment().subtract(6, 'minutes'),
		});

		const task = new CheckBalanceTask({
			alert,
			billing,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			account,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(alertSendedCount).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('should send alert if balance lt ratio', async () => {
		let alertSendedCount = 0;
		const alert = {
			sendError() {
				alertSendedCount += 1;
			},
		};
		this.config.checkBalanceTask.interval = 5;
		this.config.checkBalanceTask.ratio = 0.7;
		this.config.prices.like = 3;
		this.config.prices.repost = 3;
		this.config.prices.comment = 3;

		const user = mongoose.model('AccountUser').createInstance({
			email: 'test',
			password: 'test',
			balance: 1000,
		});
		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const likesTaskDocument = mongoose.model('AutoLikesTask').createInstance({
			user,
			group,
			likesCount: 250,
			postLink: 'test',
			commentsCount: 0,
			repostsCount: 0,
		});

		await Promise.all([group.save(), user.save(), likesTaskDocument.save()]);

		const billing = new Billing(this.config, loggerMock);
		const account = new BillingAccount(user, this.config, billing, loggerMock);

		const taskDocument = mongoose.model('CheckBalanceTask').createInstance({
			user,
			lastHandleAt: moment().subtract(6, 'minutes'),
		});

		const task = new CheckBalanceTask({
			alert,
			billing,
			taskDocument,
			logger: loggerMock,
			config: this.config,
			account,
		});

		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(alertSendedCount).to.be.equals(1);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.waiting);
	});
});
