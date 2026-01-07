import { Text } from 'ink';
import React from 'react';
import { AVAILABLE_COMMANDS } from '../lib/commands.js';

export function Help() {
	return (
		<Text>
			Available commands:{'\n'}
			{AVAILABLE_COMMANDS.map((cmd) => `  ${cmd.label}`).join('\n')}
		</Text>
	);
}
