import bluebird                      from 'bluebird';
import config                        from 'config';
import logger                        from '../../lib/logger';
import { getActualTasks, processTask } from './tasks/likes';
import { connect }                   from '../../lib/amqp';

(async () => {
	try {
		await connect();
		setInterval(async () => {
			const tasks = await getActualTasks();
			if (!tasks.length) {
				return;
			}
			
			await bluebird.map(
				tasks,
				async (task) => {
					if (task.__t !== 'LikesTask') {
						return logger.warn({
							message: 'there is no task processor',
							task,
						});
					}
					
					return processTask(task);
				},
				{ concurrency: 1 },
			);
		}, config.get('cron.interval'));
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

// @TODO: Для прод мода убрать
process.on('SIGTERM', () => {
	process.exit(0);
});
