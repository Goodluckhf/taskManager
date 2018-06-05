// @flow

import bluebird from 'bluebird';
import mongoose from 'mongoose';
import config   from 'config';
import logger   from './logger';

mongoose.Promise = bluebird;

const uri = config.get('db.connectionURI');
const reconnectionInterval = config.get('db.reconnectInterval');

const connectWithRetry = (uri) => {
	mongoose.connect(uri).then(() => {
		logger.info(`db connected via ${uri}`);
	}).catch((error) => {
		logger.error(`MongoDb connection error. Try to reconnect after ${reconnectionInterval}`, error);
		
		return reconnect(reconnectionInterval);
	});
};

// Reconnect if first try failed
const reconnect = async (ms: number) => {
	await bluebird.delay(ms);
	
	connectWithRetry(uri);
};

export default {
	connect (): Mongoose$Connection {
		connectWithRetry(uri);

		return mongoose.connection;
	},
}