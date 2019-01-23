import mongoose from '../../../lib/mongoose';

const userSchema = new mongoose.Schema({
	push: {
		type: String,
		require: true,
	},
});

export default userSchema;
