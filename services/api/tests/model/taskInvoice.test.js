import { expect } from 'chai';
import mongoose from '../../../../lib/mongoose';
import { statuses } from '../../model/Invoice';

describe('TaskInvoice', () => {
	describe('setStatus', () => {
		const { active, paid, inactive } = statuses;

		[{ status: paid, method: 'setPaid' }, { status: inactive, method: 'setInactive' }].forEach(
			({ status, method }) => {
				it('should set paid status for single invoice', async () => {
					const user = mongoose.model('AccountUser').createInstance({
						email: 'test',
						password: 'test',
					});

					const task = mongoose.model('LikesTask').createInstance({
						postLink: 'test',
						likesCount: 10,
					});

					const invoice = mongoose.model('TaskInvoice').createInstance({
						amount: 10,
						user,
						task,
					});

					await invoice.save();
					expect(invoice.status).to.be.equals(active);
					await mongoose.model('TaskInvoice')[method](invoice);
					expect(invoice.status).to.be.equals(status);
				});

				it('should set status paid for array of invoices', async () => {
					const user = mongoose.model('AccountUser').createInstance({
						email: 'test',
						password: 'test',
					});

					const task = mongoose.model('LikesTask').createInstance({
						postLink: 'test',
						likesCount: 10,
					});

					const invoice = mongoose.model('TaskInvoice').createInstance({
						amount: 10,
						user,
						task,
					});

					const invoice1 = mongoose.model('TaskInvoice').createInstance({
						amount: 10,
						user,
						task,
					});

					await invoice.save();
					await invoice1.save();
					expect(invoice.status).to.be.equals(active);
					expect(invoice1.status).to.be.equals(active);
					await mongoose.model('TaskInvoice')[method]([invoice, invoice1]);
					expect(invoice.status).to.be.equals(status);
					expect(invoice1.status).to.be.equals(status);
				});
			},
		);
	});
});
