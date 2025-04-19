import { config } from '@repo/eslint-config/base'

/** @type {import("eslint").Linter.Config} */
export default [
	...config,
	{
		// Disable turbo env var rule specifically for the env file in this app
		files: ['./src/env.ts', './src/loadEnv.ts'],
		rules: {
			'turbo/no-undeclared-env-vars': 'off',
		},
	},
]
