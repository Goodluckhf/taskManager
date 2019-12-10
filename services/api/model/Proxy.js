import { random } from 'lodash';
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
	 * @returns {Promise<ProxyDocument>}
	 */
	static async getRandom() {
		const proxies = await this.find({ isActive: true })
			.lean()
			.exec();

		return proxies[random(0, proxies.length - 1)];
	}
}

proxySchema.loadClass(ProxyDocument);

export default proxySchema;
