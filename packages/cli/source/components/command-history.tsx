import figureSet from 'figures';
import { Box, Text } from 'ink';
import { useAtomValue } from 'jotai';
import React from 'react';
import { GRAY_HIGHLIGHT } from '../lib/constants/colors.js';
import { commandLogAtom } from '../lib/store/command-log.atom.js';

export function CommandHistory() {
	const commandLog = useAtomValue(commandLogAtom);

	return (
		<Box flexDirection="column">
			{commandLog.map((entry, index) => (
				<Box key={entry.id} marginY={index > 0 ? 0.5 : 0} flexDirection="column">
					<Text dimColor backgroundColor={GRAY_HIGHLIGHT}>
						{' '}
						<Text color="green">{figureSet.pointer} </Text>
						{entry.input}{' '}
					</Text>
					<Box marginTop={1}>{entry.output}</Box>
				</Box>
			))}
		</Box>
	);
}
