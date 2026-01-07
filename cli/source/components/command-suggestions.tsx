import { Box } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { AVAILABLE_COMMANDS } from '../lib/commands.js';

type Props = {
	show: boolean;
	onSelect: (value: string) => void;
};

export function CommandSuggestions({ show, onSelect }: Props) {
	if (!show) return null;

	const items = AVAILABLE_COMMANDS.map((cmd) => ({
		label: cmd.label,
		value: cmd.name,
	}));

	return (
		<Box flexDirection="column" marginLeft={2} borderStyle="round" borderColor="gray" paddingX={1}>
			<SelectInput items={items} onSelect={(item) => onSelect(item.value)} />
		</Box>
	);
}
