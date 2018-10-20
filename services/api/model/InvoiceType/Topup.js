import mongoose from '../../../../lib/mongoose';
import { getRandomNumberString } from '../../../../lib/helper';

const topUpInvoiceSchema = new mongoose.Schema({
	purse: {
		type: String,
	},
	
	note: {
		type    : String,
		required: true,
	},
	
	// Реальные деньги
	money: {
		type: Number,
	},
});

const noteSize = 10;
/**
 * @extends InvoiceDocument
 * @property {String} purse
 * @property {String} note
 * @property {Number} money
 */
class TopUpInvoiceDocument {
	/**
	 * @param {String} purse
	 * @param {Number} money
	 * @return {TopUpInvoiceDocument}
	 */
	static createInstance({ purse, money, ...args }) {
		const invoice = mongoose.model('Invoice').createInstance(this, args);
		invoice.purse = purse;
		invoice.money = money;
		invoice.note  = getRandomNumberString(noteSize);
		return invoice;
	}
}

topUpInvoiceSchema.loadClass(TopUpInvoiceDocument);

export default topUpInvoiceSchema;
