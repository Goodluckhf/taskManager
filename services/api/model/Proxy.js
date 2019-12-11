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
	errorComment: {
		type: mongoose.Mixed,
	},
});

class ProxyDocument {
	static async countActive() {
		return this.count({ isActive: true });
	}

	/**
	 * @returns {Promise<ProxyDocument>}
	 */
	static async getRandom() {
		const proxies = await this.find({ isActive: true })
			.lean()
			.exec();

		return proxies[random(0, proxies.length - 1)];
	}

	static async setInactive(url, reason) {
		const proxy = await this.findOne({ url });
		proxy.isActive = false;
		proxy.errorComment = reason;
		await proxy.save();
	}
}

proxySchema.loadClass(ProxyDocument);

export default proxySchema;
