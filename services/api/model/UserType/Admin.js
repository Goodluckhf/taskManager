import mongoose from '../../../../lib/mongoose';

const adminSchema = new mongoose.Schema({});

/**
 * @extends UserDocument
 */
export class AdminDocument {
	/**
	 * @param {Object} opts
	 * @return {AdminDocument}
	 */
	static createInstance(opts) {
		return mongoose.model('User').createInstance(this, opts);
	}
}

adminSchema.loadClass(AdminDocument);

export default adminSchema;
