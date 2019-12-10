import { shuffle } from 'lodash';
import mongoose from '../../../lib/mongoose';

const proxySchema = new mongoose.Schema({
	url: {
		type: String,
		required: true,
	},
	login: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
});

class ProxyDocument {
	/**
	 * @param {Number} count
	 * @returns {Promise<Array<ProxyDocument>>}
	 */
	static async findActive(count) {
		const users = await this.find({ isActive: true })
			.limit(count)
			.exec()
			.lean();

		return shuffle(users);
	}
}

proxySchema.loadClass(ProxyDocument);

export default proxySchema;
