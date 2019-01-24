import userSchema from './User';

// Initialise mongoose models
export default connection => {
	connection.model('UserPush', userSchema);
};
