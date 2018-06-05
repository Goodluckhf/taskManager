// @flow
import mongoose from 'mongoose';
import config   from 'config';
import logger   from './logger';

export default {
	connect (): Mongoose$Connection {
		const uri = config.get('db.connectionURI');
		mongoose.connect(uri).then(() => {
			logger.info(`db connected via ${uri}`);
		}).catch((error) => {
			logger.error(error);
		});
		
		return mongoose.connection;
	},
}