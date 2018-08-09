import config   from 'config';
import bluebird from 'bluebird';
import amqp     from '../../lib/amqp';
import logger   from '../../lib/logger';

const processMessage = async (msg) => {
	const data = JSON.parse(msg.content.toString());
	logger.info({
		message: 'Receive data',
		data,
	});
	
	await bluebird.delay(5000);
	
	/*const result = await request(`http://api:3000/api/task/${data.id}/finish`, {
		method: 'POST',
		json  : true,
	});
	logger.info({
		message: `task "${data.id}" has successfully completed`,
		result,
	});*/
};

(async () => {
	try {
		const connection = await amqp;
		const channel = await connection.createChannel();
		await channel.assertQueue(config.get('taskQueue.name'));
		channel.prefetch(config.get('taskQueue.prefetch'));
		channel.consume(config.get('taskQueue.name'), async (msg) => {
			if (msg === null) {
				return;
			}
			
			try {
				await processMessage(msg);
			} catch (error) {
				channel.nack(msg);
			}
			
			channel.ack(msg);
		});
	} catch (error) {
		logger.error({ error });
	}
})();

process.on('uncaughtException', (error) => {
	logger.error({ error });
});

process.on('unhandledRejection', (error) => {
	logger.error({ error });
});
