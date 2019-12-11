import _ from 'lodash';
import config from 'config';
import { expect } from 'chai';
import BillingAccount from '../../billing/BillingAccount';
import Billing from '../../billing/Billing';
import mongoose from '../../../../lib/mongoose';
import CommentsByStrategyApi from '../../api/CommentsByStrategyApi';
import { UserIsNotReady, ValidationError } from '../../api/errors';
import AdminAccount from '../../billing/AdminAccount';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('AutolikesApi', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('should throw error if user is common', async () => {
		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({
			password: 'test',
			email: 'test',
			balance: 1000,
		});
		await user.save();
		const account = new BillingAccount(user, this.config, billing, loggerMock);
		const api = new CommentsByStrategyApi(this.config, loggerMock);
		await expect(
			api.create(account, {
				postLink: 'testLink',
				comments: [{ userFakeId: 0, text: 'text' }],
			}),
		).to.be.rejectedWith(UserIsNotReady);
		const count = await mongoose.model('CommentsByStrategyTask').count();
		expect(count).to.be.equals(0);
	});

	describe('Validation', () => {
		beforeEach(async () => {
			const billing = new Billing(this.config, loggerMock);
			const user = mongoose.model('AdminUser').createInstance({
				password: 'test',
				email: 'test',
			});

			await user.save();

			this.account = new AdminAccount(user, this.config, billing, loggerMock);
			this.api = new CommentsByStrategyApi(this.config, loggerMock);
		});

		it('Should return validation error if there is no text', async () => {
			await expect(
				this.api.create(this.account, {
					postLink: 'testLink',
					comments: [{ userFakeId: 0 }],
				}),
			).to.be.rejectedWith(ValidationError);

			const count = await mongoose.model('CommentsByStrategyTask').count();
			expect(count).to.be.equals(0);
		});

		it('Should return validation error if there is no userFakeId', async () => {
			await expect(
				this.api.create(this.account, {
					postLink: 'testLink',
					comments: [{ text: 'rand text' }],
				}),
			).to.be.rejectedWith(ValidationError);
			const count = await mongoose.model('CommentsByStrategyTask').count();
			expect(count).to.be.equals(0);
		});

		it('Should return validation error if there is no postLink', async () => {
			await expect(
				this.api.create(this.account, {
					comments: [{ text: 'rand text', userFakeId: 0 }],
				}),
			).to.be.rejectedWith(ValidationError);
			const count = await mongoose.model('CommentsByStrategyTask').count();
			expect(count).to.be.equals(0);
		});
	});

	it('Should create delayed task', async () => {
		const billing = new Billing(this.config, loggerMock);
		const user = mongoose.model('AdminUser').createInstance({
			password: 'test',
			email: 'test',
		});

		await user.save();

		const account = new AdminAccount(user, this.config, billing, loggerMock);
		const api = new CommentsByStrategyApi(this.config, loggerMock);
		await api.create(account, {
			postLink: 'testLink',
			comments: [{ userFakeId: 0, text: 'text' }],
		});

		const task = await mongoose.model('CommentsByStrategyTask').findOne();
		expect(task.startAt).to.be.instanceOf(Date);
		expect(task.postLink).to.be.equals('testLink');
	});
});
