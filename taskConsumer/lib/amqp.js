import amqp     from 'amqplib';
import config   from 'config';
import bluebird from 'bluebird';
import logger   from './logger';

const connectionURI = `amqp://${config.get('rabbit.host')}:${config.get('rabbit.port')}`;

const connect = async () => {
	try {
		const connection = await amqp.connect(connectionURI);
		logger.info(`successfully connected to rabbit via: ${connectionURI}`);
		return connection;
	} catch (error) {
		logger.error({
			message: `reconnecting to rabbit in: ${config.get('rabbit.reconnectInterval')}ms`,
			error,
		});
		
		await bluebird.delay(config.get('rabbit.reconnectInterval'));
		return connect();
	}
};

export default connect();
