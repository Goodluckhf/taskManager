// @flow

import bluebird from 'bluebird';
import mongoose from 'mongoose';
import config   from 'config';
import logger   from './logger';

mongoose.Promise = bluebird;

const connectionUri = config.get('db.connectionURI');
const reconnectionInterval = config.get('db.reconnectInterval');

const connectWithRetry = (uri) => {
	mongoose.connect(uri).then(() => {
		logger.info(`db connected via ${uri}`);
	}).catch((error) => {
		logger.error(`MongoDb connection error. Try to reconnect after ${reconnectionInterval}`, error);
		
		return bluebird.delay(reconnectionInterval)
			.then(() => connectWithRetry(uri));
	});
};

export default {
	connect(): Mongoose$Connection {
		connectWithRetry(connectionUri);
		
		return mongoose.connection;
	},
};
