import { Box, Text } from 'ink';
import React from 'react';

type HistoryItem = {
	input: string;
	output: string;
};

type Props = {
	history: HistoryItem[];
};

export function CommandHistory({ history }: Props) {
	return (
		<Box flexDirection="column">
			{history.map((item, index) => (
				<Box key={index} flexDirection="column">
					<Text>
						<Text color="green">&gt; </Text>
						{item.input}
					</Text>
					<Text>{item.output}</Text>
				</Box>
			))}
		</Box>
	);
}
