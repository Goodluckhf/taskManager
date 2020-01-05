import config from 'config';
import axios from 'axios';
import logger from '../../lib/logger';

const baseUrl = `http://${config.get('api.host')}:${config.get('api.port')}/api`;

setInterval(async () => {
	await axios.get(`${baseUrl}/task/handleActive`);
}, config.get('cron.interval'));

process.on('uncaughtException', error => {
	logger.error({ error });
});

process.on('unhandledRejection', _error => {
	const error = _error;
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	if (error.request) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		delete error.request;
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	if (error.response && error.response.request) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		delete error.response.request;
	}

	logger.error({ error });
});

// @TODO: Для прод мода убрать
process.on('SIGTERM', () => {
	process.exit(0);
});
