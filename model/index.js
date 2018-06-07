// @flow

const schema = require('./Task').default;

// Initialise mongoose models
export default (connection: Mongoose$Connection): void => {
	connection.model('Task', schema);
};
