import { shuffle } from 'lodash';
import mongoose from '../../../lib/mongoose';

const vkUserSchema = new mongoose.Schema({
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

class VkUserDocument {
	/**
	 * @param {Number} count
	 * @returns {Promise<Array<VkUserDocument>>}
	 */
	static async findActive(count) {
		const users = await this.find({ isActive: true })
			.limit(count)
			.lean()
			.exec();

		return shuffle(users);
	}
}

vkUserSchema.loadClass(VkUserDocument);

export default vkUserSchema;
