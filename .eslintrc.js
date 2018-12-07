module.exports = {
	root: true,
	extends: ['eslint-config-airbnb-base', 'plugin:prettier/recommended'],
	plugins: ['prettier'],
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module',
		allowImportExportEverywhere: false,
		codeFrame: false,
	},
	env: {
		node: true,
	},
	rules: {
		strict: 'error',
		'no-param-reassign': 'off',
		'no-underscore-dangle': 'off',
		'no-restricted-syntax': 'off',
		'class-methods-use-this': 'off',
		'prettier/prettier': 'error',
		'import/no-extraneous-dependencies': [
			'error',
			{ devDependencies: ['**/*.test.js', '**/*.spec.js', 'jest/*.js', 'jest.config.js'] },
		],
		'no-multi-spaces': 0,
		indent: ['error', 'tab'],
		'no-tabs': 0,
		'spaced-comment': 0,
		'no-trailing-spaces': 0,
		'arrow-body-style': [1, 'as-needed'],
	},
	overrides: [
		{
			files: ['*.test.js', '*.spec.js', 'test/**/*.js'],
			env: {
				jest: true,
			},
			rules: {
				'no-console': 'off',
			},
		},
	],
};
