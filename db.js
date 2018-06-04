// @flow
import mongoose     from 'mongoose';
import DbConnection from 'lib/DbConnection';
import config       from 'config';


const connection = new DbConnection({ ...config.get('db'), client: mongoose });
let isConnected  = false;

const connect = opts => {
	connection.connect();
	return connection;
};

export default {
	get connection() {
		if (isConnected) {
			return connection;
		}
		
		return connect();
	}
}