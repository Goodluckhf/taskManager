import { expect }          from 'chai';
import config              from 'config';
import _                   from 'lodash';
import mongoose            from '../../../../lib/mongoose';
import UserApi             from '../../api/UserApi';
import Billing             from '../../billing/Billing';
import { ValidationError } from '../../api/errors';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('UserApi', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	describe('createTopUpInvoice', () => {
		it('should throw error if user is not Billing user', async () => {
			const user = mongoose.model('PremiumUser').createInstance({
				password: 'test',
				email   : 'test',
			});
			
			const billing = new Billing(this.config, loggerMock);
			const api = new UserApi({}, billing, this.config, loggerMock);
			const account = billing.createAccount(user);
			const promise = api.createTopUpInvoice(account, 100);
			expect(promise).to.be.rejectedWith(ValidationError);
		});
		
		it('should update old active invoice if exists', async () => {
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email   : 'test',
			});
			
			const billing = new Billing(this.config, loggerMock);
			const invoice = mongoose.model('TopUpInvoice').createInstance({
				amount: 70,
				user,
			});
			await invoice.save();
			
			const api = new UserApi({}, billing, this.config, loggerMock);
			const account = billing.createAccount(user);
			const promise = api.createTopUpInvoice(account, 100);
			await expect(promise).to.be.fulfilled;
			const findedOldInvoice = await mongoose.model('TopUpInvoice').findById(invoice._id);
			expect(findedOldInvoice.amount).to.be.equals(100);
			expect(findedOldInvoice.note).to.be.equals(invoice.note);
		});
		
		it('should new invoice if there is no active exists', async () => {
			const user = mongoose.model('AccountUser').createInstance({
				password: 'test',
				email   : 'test',
			});
			
			const billing = new Billing(this.config, loggerMock);
			
			const api = new UserApi({}, billing, this.config, loggerMock);
			const account = billing.createAccount(user);
			const promise = api.createTopUpInvoice(account, 100);
			await expect(promise).to.be.fulfilled;
			const findedInvoice = await mongoose.model('TopUpInvoice').findOne({
				user: user.id,
			});
			expect(findedInvoice.amount).to.be.equals(100);
		});
	});
});
