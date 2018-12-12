import mongoose from '../../../../lib/mongoose';

const likestServiceSchema = new mongoose.Schema(
	{
		login: {
			type: String,
		},

		password: {
			type: String,
		},
	},
	{ _id: false },
);

const z1x1y1ServiceSchema = new mongoose.Schema(
	{
		token: {
			type: String,
		},
	},
	{ _id: false },
);

const likeProServiceSchema = new mongoose.Schema(
	{
		login: {
			type: String,
		},

		password: {
			type: String,
		},
	},
	{ _id: false },
);

const smmBroServiceSchema = new mongoose.Schema(
	{
		login: {
			type: String,
		},

		password: {
			type: String,
		},
	},
	{ _id: false },
);

const servicesSchema = new mongoose.Schema(
	{
		likest: {
			type: likestServiceSchema,
		},

		z1y1x1: {
			type: z1x1y1ServiceSchema,
		},

		likePro: {
			type: likeProServiceSchema,
		},

		smmBro: {
			type: smmBroServiceSchema,
		},
	},
	{ _id: false },
);

const premiumUserSchema = new mongoose.Schema({
	services: {
		type: servicesSchema,
		default: {},
	},
});

/**
 * @extends UserDocument
 * @property {Object} services
 */
export class PremiumUserDocument {
	/**
	 * @param {UserDocument} user
	 * @param {Object} services
	 * @param {Object} services.likest
	 * @param {String} services.likest.login
	 * @param {String} services.likest.password
	 * @param {Object} services.likePro
	 * @param {String} services.likePro.login
	 * @param {String} services.likePro.password
	 * @param {Object} services.z1y1x1
	 * @param {String} services.z1y1x1.token
	 */
	static upgrade(user, services) {
		user.__t = 'PremiumUser';
		user.services = services;
		return user.save();
	}

	static createInstance(opts) {
		return mongoose.model('User').createInstance(this, opts);
	}
}

premiumUserSchema.loadClass(PremiumUserDocument);

export default premiumUserSchema;
