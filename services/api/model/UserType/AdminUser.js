import mongoose from '../../../../lib/mongoose';

const adminSchema = new mongoose.Schema({});

/**
 * @extends UserDocument
 */
export class AdminUserDocument {
	/**
	 * @param {Object} opts
	 * @return {AdminUserDocument}
	 */
	static createInstance(opts) {
		return mongoose.model('User').createInstance(this, opts);
	}
}

adminSchema.loadClass(AdminUserDocument);

export default adminSchema;
