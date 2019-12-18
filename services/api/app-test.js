// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
require('@babel/register')({
	configFile: `${__dirname}/.babelrc`,
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

require('./app');
