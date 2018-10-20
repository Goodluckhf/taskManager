import bunyan       from 'bunyan';
import StdoutStream from 'bunyan-stdout-stream';

let stream = {
	level : 'trace',
	stream: process.stdout,
};

if (process.env.NODE_ENV === 'development') {
	stream = {
		level : 'trace',
		type  : 'raw',
		stream: new StdoutStream({ maxDepth: 10 }),
	};
}

const logger = bunyan.createLogger({
	name       : 'devLogger',
	streams    : [stream],
	serializers: {
		error: (err) => {
			const error = bunyan.stdSerializers.err(err);
			return {
				...error,
				...err,
			};
		},
		request : bunyan.stdSerializers.req,
		response: bunyan.stdSerializers.res,
	},
});

export default logger;
