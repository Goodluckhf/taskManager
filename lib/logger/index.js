import bunyan       from 'bunyan';
import StdoutLogger from './StdoutStream';

// @TODO: Сделать для прод режима
const logger = bunyan.createLogger({
	name   : 'devLogger',
	streams: [
		{
			level : 'trace',
			type  : 'raw',
			stream: new StdoutLogger(process.stdout),
		},
	],
});

export default logger;
