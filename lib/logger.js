import bunyan       from 'bunyan';
import StdoutStream from 'bunyan-stdout-stream';

// @TODO: Сделать для прод режима
const logger = bunyan.createLogger({
	name   : 'devLogger',
	streams: [
		{
			level : 'trace',
			type  : 'raw',
			stream: new StdoutStream({ maxDepth: 10 }),
		},
	],
	serializers: bunyan.stdSerializers,
});

export default logger;
