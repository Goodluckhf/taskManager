import bunyan       from 'bunyan';
import StdoutStream from './StdoutStream';

// @TODO: Сделать для прод режима
const logger = bunyan.createLogger({
	name   : 'devLogger',
	streams: [
		{
			level : 'trace',
			type  : 'raw',
			stream: new StdoutStream(process.stdout),
		},
	],
	serializers: bunyan.stdSerializers,
});

export default logger;
