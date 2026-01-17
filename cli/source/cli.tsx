#!/usr/bin/env node
import { render } from 'ink';
import React from 'react';
import { DialogManager } from './components/dialog-manager.js';
import Index from './index.js';
import { API_URL } from './lib/constants/index.js';
import { client } from './lib/generated/client.gen.js';
import { QueryProvider } from './providers/query-client.provider.js';

client.setConfig({
	baseUrl: API_URL,
});

process.stdout.write('\x1Bc');

render(
	<QueryProvider>
		<DialogManager>
			<Index />
		</DialogManager>
	</QueryProvider>,
);
