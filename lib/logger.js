const bunyan            = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');

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
	}
});

module.exports = logger;