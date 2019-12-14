import mongoose from '../../../../lib/mongoose';

const userCredentialsSchema = new mongoose.Schema({
	login: { type: String, required: true },
	password: { type: String, required: true },
});

const checkAndAddUsersTaskSchema = new mongoose.Schema({
	usersCredentials: [userCredentialsSchema],
});

export class checkAndAddUsersTask {
	/**
	 * @param {Object} opts
	 * @param {Array<Object>} opts.usersCredentials
	 * @return {CommentsByStrategyTask}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.usersCredentials = opts.usersCredentials;
		return baseTask;
	}
}

checkAndAddUsersTaskSchema.loadClass(checkAndAddUsersTask);

export default checkAndAddUsersTaskSchema;
