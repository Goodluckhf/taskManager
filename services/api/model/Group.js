import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	publicId: {
		type   : String,
		default: null,
	},
	
	name: {
		type   : String,
		default: null,
	},
	
	domain: {
		type   : String,
		default: null,
	},
	
	image: {
		type   : String,
		default: null,
	},
	
	admin: {
		type   : String,
		default: null,
	},
});

/**
 * @property {Number} publicId
 * @property {String} name
 * @property {String} domain
 * @property {String} image
 * @property {String} admin
 */
class GroupDocument {
	/**
	 * @param {String} name
	 * @param {String} photo_200
	 * @param {Number} id
	 * @param {String} screen_name
	 */
	/* eslint-disable camelcase */
	// eslint-disable-next-line object-curly-newline
	static createInstance({ name, photo_200, id, screen_name }) {
		const group = new this();
		
		group.publicId = id;
		group.name     = name;
		group.image    = photo_200;
		group.domain   = screen_name;
		return group;
	}
	
	/**
	 * @param {Number} id
	 * @param {Object} data
	 * @return {GroupDocument}
	 */
	static async findOrCreateByPublicId(id, data) {
		const group = await this.findOne({ publicId: id });
		
		if (group) {
			return group;
		}
		
		const newGroup = this.createInstance(data);
		return newGroup.save();
	}
	
	/**
	 * @param {String} publicId
	 * @return {String}
	 */
	static getLinkByPublicId(publicId) {
		return `https://vk.com/club${publicId}`;
	}
}
/* eslint-enable camelcase */

schema.loadClass(GroupDocument);

export default schema;
