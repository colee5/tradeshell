import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
};

export function CommandInput({ value, onChange, onSubmit }: Props) {
	return (
		<Box flexDirection="column">
			<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
			<Box paddingX={1}>
				<Text color="green">&gt; </Text>
				<TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
			</Box>
			<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
		</Box>
	);
}
