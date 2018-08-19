import config   from 'config';
import axios    from 'axios';
import logger   from '../../lib/logger';

const baseUrl = `http://${config.get('api.host')}:${config.get('api.port')}/api`;

setInterval(async () => {
	const { data: { data } } = await axios.get(`${baseUrl}/task/handleActive`);
	logger.info({
		data,
		message: 'cron task sent',
	});
	//@TODO: Если не будет успевать за интервал, можно сделать пропуск
}, config.get('cron.interval'));

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
