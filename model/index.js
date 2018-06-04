// @flow
import mongoose from 'mongoose';

export default (connection: mongoose) => {
	const createModel = (name: string)  => {
		const modelFactory = require(`./${name}`).default;
		return modelFactory(connection);
	};
	
	createModel('Task');
};

