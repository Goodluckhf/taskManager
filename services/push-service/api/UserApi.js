import mongoose from '../../../lib/mongoose';
import BaseApi from './BaseApi';

class UserApi extends BaseApi {
	async addPush({ push }) {
		const User = mongoose.model('User');
		const count = await User.count({
			push,
		});

		if (count > 0) {
			return;
		}

		const newUser = new User();
		newUser.push = push;
		await newUser.save();
	}

	async count() {
		return mongoose.model('User').count();
	}
}

export default UserApi;
