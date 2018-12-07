import mongoose from '../../../lib/mongoose';

const accountSchema = new mongoose.Schema({
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

	// Ссылка на профиль в вк
	link: {
		type: String,
		default: '',
	},
});

/**
 * @property {String} login
 * @property {String} password
 * @property {String} link
 * @property {Boolean} isActive
 */
class AccountDocument {
	/**
	 * @param {String} login
	 * @param {String} password
	 * @param {String} link
	 * @return AccountDocument
	 */
	static createInstance({ login, password, link }) {
		const account = new this();

		account.login = login;
		account.password = password;
		account.link = link;
		return account;
	}
}

accountSchema.loadClass(AccountDocument);

export default accountSchema;
