module.exports = {
	root: true,
	extends: [
		'eslint-config-airbnb-base',
		'plugin:@typescript-eslint/recommended',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended',
		'plugin:import/typescript',
	],
	plugins: ['prettier', '@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		allowImportExportEverywhere: false,
		codeFrame: false,
	},
	env: {
		node: true,
	},
	rules: {
		'import/prefer-default-export': 'off',
		'no-useless-constructor': 'off',
		'import/no-duplicates': 'off',
		'no-await-in-loop': 'off',
		strict: 'error',
		'import/extensions': 'off',
		'import/no-named-as-default': 0,
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
			files: ['*.test.js', '*.spec.js', 'test/**/*.js', '*.spec.ts'],
			env: {
				jest: true,
			},
			rules: {
				'no-console': 'off',
				'no-plusplus': 'off',
				'import/no-extraneous-dependencies': 'off',
			},
		},
	],
};
