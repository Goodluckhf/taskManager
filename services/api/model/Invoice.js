import moment   from 'moment';
import mongoose from '../../../lib/mongoose';

const statuses = {
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
		type   : Date,
		default: moment.now,
	},
	
	paidAt: {
		type: Date,
	},
	
	status: {
		type   : Number,
		enum   : Object.values(statuses),
		default: statuses.active,
	},
	
	amount: {
		type    : Number,
		required: true,
	},
	
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref : 'User',
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
	static createInstance(Constructor, { amount, user, status }) {
		const invoice  = new Constructor();
		invoice.amount = amount;
		invoice.user   = user;
		invoice.status = status;
		return invoice;
	}
}

invoiceSchema.loadClass(InvoiceDocument);

export default invoiceSchema;
