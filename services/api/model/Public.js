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
	
	admin: {
		type   : String,
		default: null,
	},
});

export default schema;
