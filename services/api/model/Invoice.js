import moment from 'moment';

import mongoose        from '../../../lib/mongoose';
import { arrayToHash } from '../../../lib/helper';

const types = ['like', 'repost', 'comment', 'topUp'];

const invoiceSchema = new mongoose.Schema({
	createdAt: {
		type   : Date,
		default: moment.now,
	},
	
	invoiceType: {
		type: String,
		enum: types,
	},
	
	price: {
		type    : Number,
		required: true,
	},
	
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref : 'User',
	},
});

invoiceSchema.statics.invoiceType = arrayToHash(types);

/**
 * @property {Date} createdAt
 * @property {String} invoiceType
 * @property {Number} price
 * @property {UserDocument} user
 */
class InvoiceDocument {
	/**
	 * @param {Number} price
	 * @param {String} type
	 * @param {UserDocument} user
	 * @return {InvoiceDocument}
	 */
	static createInstance({ price, type, user }) {
		const invoice       = new this();
		invoice.price       = price;
		invoice.invoiceType = type;
		invoice.user        = user;
		return invoice;
	}
}

invoiceSchema.loadClass(InvoiceDocument);

export default invoiceSchema;
