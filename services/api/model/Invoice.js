import bluebird from 'bluebird';
import moment from 'moment';
import mongoose from '../../../lib/mongoose';

export const statuses = {
	// Ждет платежа
	// Или деньги заморожены
	active: 0,

	// Отмена платежа
	// Или rollback
	inactive: 1,

	// Оплачен или пополнен
	paid: 2,
};

const invoiceSchema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: moment.now,
	},

	paidAt: {
		type: Date,
	},

	status: {
		type: Number,
		enum: Object.values(statuses),
		default: statuses.active,
	},

	amount: {
		type: Number,
		required: true,
	},

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
});

invoiceSchema.statics.status = statuses;

/**
 * @property {Date} createdAt
 * @property {Number} amount
 * @property {UserDocument} user
 */
class InvoiceDocument {
	/**
	 * @param {Number} amount
	 * @param {UserDocument} user
	 * @param {Number} status
	 * @return {InvoiceDocument}
	 */
	static createInstance(Constructor, { amount, user, status = statuses.active }) {
		const invoice = new Constructor();
		invoice.amount = amount;
		invoice.user = user;
		invoice.status = status;
		return invoice;
	}

	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @param {Number} status
	 * @return {Promise<void>}
	 * @private
	 */
	static async _setStatus(invoice, status) {
		const invoices = Array.isArray(invoice) ? invoice : [invoice];

		await bluebird.map(invoices, async _invoice => {
			_invoice.status = status;
			// @TODO: Зарефакторить
			if (status === mongoose.model('Invoice').status.paid) {
				_invoice.paidAt = moment.now();
			}
			return _invoice.save();
		});
	}

	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 */
	static async setPaid(invoice) {
		return this._setStatus(invoice, mongoose.model('Invoice').status.paid);
	}

	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 */
	static async setInactive(invoice) {
		return this._setStatus(invoice, mongoose.model('Invoice').status.inactive);
	}
}

invoiceSchema.loadClass(InvoiceDocument);

export default invoiceSchema;
