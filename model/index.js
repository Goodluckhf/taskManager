// @flow

import schema from './Task';

// Initialise mongoose models
export default (connection: Mongoose$Connection): void => {
	connection.model('Task', schema);
};
