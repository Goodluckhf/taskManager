import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
	login: {
		type    : String,
		required: true,
	},
	
	password: {
		type    : String,
		required: true,
	},
	
	isActive: {
		type   : Boolean,
		default: true,
	},
	
	// Ссылка на профиль в вк
	link: {
		type   : String,
		default: '',
	},
});


export default accountSchema;
