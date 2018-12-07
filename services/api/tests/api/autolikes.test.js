import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';
import mongoose from '../../../../lib/mongoose';
import { NotFound } from '../../api/errors';
import Billing from '../../billing/Billing';
import BillingAccount from '../../billing/BillingAccount';
import AutoLikesApi from '../../api/AutoLikesApi';
import { NotEnoughBalance } from '../../api/errors/tasks';
import PremiumAccount from '../../billing/PremiumAccount';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('AutolikesApi', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('Should throw notFound error if there is not task', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 10,
			repost: 10,
		};

		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({
			password: 'test',
			email: 'test',
			balance: 1000,
		});

		await Promise.all([user.save()]);

		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const api = new AutoLikesApi({}, billing, this.congif, loggerMock);
		const promise = api.resume(mongoose.Types.ObjectId(), account);
		await expect(promise).to.rejectedWith(NotFound);
	});

	it('Should throw notFound error if status is not skipped', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 10,
			repost: 10,
		};

		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({
			password: 'test',
			email: 'test',
			balance: 1000,
		});

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 90,
			commentsCount: 100,
			repostsCount: 0,
			group,
			user,
		});
		taskDocument.status = mongoose.model('Task').status.pending;
		await Promise.all([user.save(), group.save(), taskDocument.save()]);

		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const api = new AutoLikesApi({}, billing, this.congif, loggerMock);
		const promise = api.resume(taskDocument._id, account);
		await expect(promise).to.rejectedWith(NotFound);
		const findedTask = await mongoose.model('AutoLikesTask').findById(taskDocument._id);
		expect(findedTask.status).to.not.be.equals(mongoose.model('Task').status.waiting);
	});

	it('Should throw error if user has not enough money', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 10,
		};

		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({
			password: 'test',
			email: 'test',
			balance: 1000,
		});

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 90,
			commentsCount: 100,
			repostsCount: 0,
			group,
			user,
		});
		taskDocument.status = mongoose.model('Task').status.skipped;
		await Promise.all([user.save(), group.save(), taskDocument.save()]);

		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const api = new AutoLikesApi({}, billing, this.congif, loggerMock);
		const promise = api.resume(taskDocument._id, account);
		await expect(promise).to.rejectedWith(NotEnoughBalance);
		const findedTask = await mongoose.model('AutoLikesTask').findById(taskDocument._id);
		expect(findedTask.status).to.not.be.equals(mongoose.model('Task').status.waiting);
	});

	it('Should resume task if use has enough money', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 10,
		};

		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({
			password: 'test',
			email: 'test',
			balance: 1000,
		});

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 90,
			commentsCount: 0,
			repostsCount: 0,
			group,
			user,
		});
		taskDocument.status = mongoose.model('Task').status.skipped;
		await Promise.all([user.save(), group.save(), taskDocument.save()]);

		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const api = new AutoLikesApi({}, billing, this.congif, loggerMock);
		const promise = api.resume(taskDocument._id, account);
		await expect(promise).to.fulfilled;
		const findedTask = await mongoose.model('AutoLikesTask').findById(taskDocument._id);
		expect(findedTask.status).to.be.equals(mongoose.model('Task').status.waiting);
	});

	it('Should resume task if user type is not billing', async () => {
		this.config.prices = {
			...this.config.prices,
			like: 10,
			comment: 10,
		};

		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('PremiumUser').createInstance({
			password: 'test',
			email: 'test',
		});

		const group = mongoose.model('Group').createInstance({ id: 'testId' });
		const taskDocument = mongoose.model('AutoLikesTask').createInstance({
			likesCount: 90,
			commentsCount: 100,
			repostsCount: 0,
			group,
			user,
		});
		taskDocument.status = mongoose.model('Task').status.skipped;
		await Promise.all([user.save(), group.save(), taskDocument.save()]);

		const account = new PremiumAccount(user, this.config, billing, loggerMock);
		const api = new AutoLikesApi({}, billing, this.congif, loggerMock);
		const promise = api.resume(taskDocument._id, account);
		await expect(promise).to.fulfilled;
		const findedTask = await mongoose.model('AutoLikesTask').findById(taskDocument._id);
		expect(findedTask.status).to.be.equals(mongoose.model('Task').status.waiting);
	});
});
