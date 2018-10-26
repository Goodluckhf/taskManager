import crypto   from 'crypto';
import mongoose from '../../../lib/mongoose';

const userSchema = new mongoose.Schema({
	email: {
		type    : String,
		required: true,
	},
	
	passwordHash: {
		type    : String,
		required: true,
	},
	
	salt: {
		type: String,
	},
	
	// Чат vk для алертов
	chatId: {
		type: Number,
	},
	
	vkId: {
		type: Number,
	},
	
	// Группы учавствующие в задачу на супер задачу
	targetGroups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Group',
	}],
	
	// Внешние ссылки учавствующие в автонакртуке
	targetLinks: [String],
});

const algorithmIterations = 100;
const hashLength          = 128;

/**
 * @property {String} email
 * @property {String} passwordHash
 * @property {Boolean} isActive
 * @property {Object} services
 * @property {String} chatId
 * @property {String} vkId
 * @property {Array.<GroupDocument>} targetGroups
 * @property {Array.<String>} targetLinks
 */
class UserDocument {
	/**
	 * @param {Function} Constructor
	 * @param {String} email
	 * @param {String} password
	 * @return UserDocument
	 */
	static createInstance(Constructor, { email, password }) {
		const user = new Constructor();
		user.email    = email;
		user.password = password;
		return user;
	}
	
	/**
	 * @param {String} value
	 */
	set password(value) {
		this.salt         = crypto.randomBytes(hashLength).toString('base64');
		this.passwordHash = crypto.pbkdf2Sync(value, this.salt, algorithmIterations, hashLength, 'sha1');
	}
	
	/**
	 * @param {String} password
	 * @return {boolean}
	 */
	checkPassword(password) {
		if (!password) {
			return false;
		}
		
		if (!this.passwordHash) {
			return false;
		}
		
		const hash = crypto.pbkdf2Sync(password, this.salt, algorithmIterations, hashLength, 'sha1');
		return hash.toString() === this.passwordHash;
	}
}

userSchema.loadClass(UserDocument);

export default userSchema;
