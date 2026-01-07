#!/usr/bin/env node
import { render } from 'ink';
import React from 'react';
import Index from './index.js';
import { QueryProvider } from './lib/query-client.js';

process.stdout.write('\x1Bc');

render(
	<QueryProvider>
		<Index />
	</QueryProvider>,
);
