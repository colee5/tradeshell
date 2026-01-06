import { Box, Text } from 'ink';
import React from 'react';
import { AVAILABLE_COMMANDS } from '../lib/commands.js';

type Props = {
	show: boolean;
};

export function CommandSuggestions({ show }: Props) {
	if (!show) return null;

	return (
		<Box flexDirection="column" marginLeft={2}>
			<Text color="gray">Available commands:</Text>
			{AVAILABLE_COMMANDS.map((cmd) => (
				<Text key={cmd.name} color="magenta">
					{cmd.label}
				</Text>
			))}
		</Box>
	);
}
