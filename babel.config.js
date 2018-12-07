module.exports = {
	retainLines: true,
	presets: [
		[
			'@babel/preset-env',
			{
				targets: {
					node: 'current',
				},
				useBuiltIns: 'usage',
				shippedProposals: true,
				loose: false,
			},
		],
	],
	plugins: [],
	ignore: ['node_modules', 'coverage', 'dist', '*.config.js'],
};
