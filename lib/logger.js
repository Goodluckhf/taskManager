import bunyan            from 'bunyan';
import bunyanDebugStream from 'bunyan-debug-stream';


// @TODO: Сделать для прод режима
const logger = bunyan.createLogger({
	name    : 'devLogger',
	streams : [
		{
			level  : 'trace',
			type   : 'raw',
			stream : bunyanDebugStream({
				forceColor: true,
			}),
		},
	],
	serializers: {
		req   : bunyan.stdSerializers.req,
		res   : bunyan.stdSerializers.res,
		error : bunyan.stdSerializers.err,
		err   : bunyan.stdSerializers.err,
	},
});

export default logger;
