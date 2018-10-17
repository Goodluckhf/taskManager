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
});

const noteSize = 10;
/**
 * @property {String} purse
 * @property {String} note
 */
class TopUpInvoiceDocument {
	/**
	 * @param {String} purse
	 * @return {TopUpInvoiceDocument}
	 */
	static createInstance({ purse, ...args }) {
		const invoice = mongoose.model('Invoice').createInstance(this, args);
		invoice.purse = purse;
		invoice.note  = getRandomNumberString(noteSize);
		return invoice;
	}
}

topUpInvoiceSchema.loadClass(TopUpInvoiceDocument);

export default topUpInvoiceSchema;
