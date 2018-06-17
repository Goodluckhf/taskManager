import bunyan       from 'bunyan';
import StdoutStream from 'bunyan-stdout-stream';

// @TODO: Сделать для прод режима
const logger = bunyan.createLogger({
	name: 'taskConsumer',
	streams: [
		{
			level : 'trace',
			type  : 'raw',
			stream: new StdoutStream(),
		},
	],
	serializers: bunyan.stdSerializers,
});

export default logger;
