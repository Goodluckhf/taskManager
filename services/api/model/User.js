import mongoose from 'mongoose';
import crypto   from 'crypto';

const likestServiceSchema = new mongoose.Schema({
	login: {
		type: String,
	},
	
	password: {
		type: String,
	},
}, { _id: false });

const z1x1y1ServiceSchema = new mongoose.Schema({
	token: {
		type: String,
	},
}, { _id: false });

const likeProServiceSchema = new mongoose.Schema({
	login: {
		type: String,
	},
	
	password: {
		type: String,
	},
}, { _id: false });

const servicesSchema = new mongoose.Schema({
	likest: {
		type: likestServiceSchema,
	},
	
	z1y1x1: {
		type: z1x1y1ServiceSchema,
	},
	
	likePro: {
		type: likeProServiceSchema,
	},
}, { _id: false });

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
	
	isActive: {
		type   : Boolean,
		default: false,
	},
	
	services: {
		type   : servicesSchema,
		default: {},
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
 */
class UserDocument {
	/**
	 * @param {String} email
	 * @param {String} password
	 * @param {Boolean} [isActive = false]
	 * @return UserDocument
	 */
	static createInstance({ email, password, isActive = false }) {
		const user = new this();
		
		user.email    = email;
		user.password = password;
		user.isActive = isActive;
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
