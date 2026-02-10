import { render } from 'ink';
import React from 'react';
import { DialogManager } from './components/dialog-manager.js';
import Index from './index.js';
import { QueryProvider } from './providers/query-client.provider.js';

process.stdout.write('\x1Bc');

render(
	<QueryProvider>
		<DialogManager>
			<Index />
		</DialogManager>
	</QueryProvider>,
);
