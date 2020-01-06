import config from 'config';
import _ from 'lodash';
import { generateRandomString } from '../helpers';

const mongoDBURI = process.env.FLAGS_MONGODB_URI || 'mongodb://127.0.0.1:27017/test';

export function generateConfig() {
	const clonedConfig = _.cloneDeep(config);
	clonedConfig.db.connectionURI = `${mongoDBURI}_${generateRandomString()}`;
	return clonedConfig;
}
