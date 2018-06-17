import request from 'request-promise';
import config  from 'config';
import amqp    from './lib/amqp';
import logger  from './lib/logger';


const processMessage = (msg) => {
	const data = JSON.parse(msg.toString());
	logger.info({ data });
};

(async () => {
	try {
		const connection = await amqp;
		const channel = await connection.createChannel();
		await channel.assertQueue(config.get('taskQueue.name'));
		channel.consume(config.get('taskQueue.name'), (msg) => {
			if (msg !== null) {
				processMessage(msg);
				channel.ack(msg);
			}
		});
	} catch (error) {
		logger.error({ error });
	}
})();
