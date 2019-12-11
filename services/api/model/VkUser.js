import { random, shuffle } from 'lodash';
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
	errorComment: {
		type: mongoose.Mixed,
	},
});

class VkUserDocument {
	static async countActive() {
		return this.count({ isActive: true });
	}

	/**
	 * @param {Number} count
	 * @returns {Promise<Array<VkUserDocument>>}
	 */
	static async findActive(count) {
		const users = await this.find({ isActive: true })
			.limit(count)
			.lean()
			.exec();

		return shuffle(shuffle(users));
	}

	static async getRandom() {
		const users = await this.find({ isActive: true })
			.lean()
			.exec();

		return users[random(0, users.length - 1)];
	}

	static async setInactive(login, reason) {
		const user = await this.findOne({ login });
		user.isActive = false;
		user.errorComment = reason;
		await user.save();
	}
}

vkUserSchema.loadClass(VkUserDocument);

export default vkUserSchema;
