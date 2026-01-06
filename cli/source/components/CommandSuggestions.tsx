import { Box, Text } from 'ink';
import React from 'react';
import { AVAILABLE_COMMANDS } from '../lib/commands.js';

type Props = {
	show: boolean;
};

export function CommandSuggestions({ show }: Props) {
	if (!show) return null;

	return (
		<Box flexDirection="column" marginTop={1} marginLeft={2}>
			<Text color="gray" dimColor>
				Available commands:
			</Text>
			{AVAILABLE_COMMANDS.map((cmd) => (
				<Text key={cmd.name} color="magenta">
					{cmd.label}
				</Text>
			))}
		</Box>
	);
}
