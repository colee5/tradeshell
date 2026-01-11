import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	client: '@hey-api/client-axios',
	input: '../api/swagger.json',
	output: './source/lib/generated',
	plugins: ['@tanstack/react-query'],
});
