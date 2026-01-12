#!/usr/bin/env node
import { render } from 'ink';
import React from 'react';
import Index from './index.js';
import { ConfigCheckerProvider } from './providers/config-checker.provider.js';
import { QueryProvider } from './providers/query-client.provider.js';
import { client } from './lib/generated/client.gen.js';
import { API_URL } from './lib/constants/index.js';

client.setConfig({
	baseUrl: API_URL,
});

process.stdout.write('\x1Bc');

render(
	<QueryProvider>
		<ConfigCheckerProvider>
			<Index />
		</ConfigCheckerProvider>
	</QueryProvider>,
);
