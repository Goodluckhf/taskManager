// @flow

// Initialise mongoose models
export default (connection: Mongoose$Connection) => {
	const createModel = (name: string): Class<Mongoose$Document>  => {
		// eslint-disable-next-line global-require, import/no-dynamic-require
		const schema = require(`./${name}`).default;
		return connection.model(name, schema);
	};
	
	createModel('Task');
};

