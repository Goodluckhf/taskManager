// @flow
import mongoose     from 'mongoose';
import config       from 'config';
import logger       from './logger';

let connection: ?mongoose = null;
let isConnected  = false;

export default {
	async connect () {
		if (isConnected) {
			return connection;
		}
		
		const uri   = config.get('db.connectionURI');
		connection  = await mongoose.connect(uri);
		logger.info(`db connected: ${uri}`);
		isConnected = true;
		return connection;
	},
	
	get connection() {
		return connection;
	},
	
	get models() {
		return connection.models;
	},
};