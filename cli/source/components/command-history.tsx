import { useAtomValue } from 'jotai';
import { Box, Text } from 'ink';
import React from 'react';
import { commandLogAtom } from '../lib/store/command-log.atom.js';

export function CommandHistory() {
	const commandLog = useAtomValue(commandLogAtom);

	return (
		<Box flexDirection="column">
			{commandLog.map((entry, index) => (
				<Box key={index} flexDirection="column">
					<Text>
						<Text color="green">&gt; </Text>
						{entry.input}
					</Text>
					{entry.output}
				</Box>
			))}
		</Box>
	);
}
