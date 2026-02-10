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

	const items: Array<{ label: string; value: string }> = [];

	AVAILABLE_COMMANDS.forEach((cmd) => {
		items.push({
			label: cmd.label,
			value: cmd.name,
		});

		if ('subcommands' in cmd && cmd.subcommands) {
			cmd.subcommands.forEach((subcmd, index) => {
				const isLast = index === cmd.subcommands!.length - 1;
				const prefix = isLast ? '  └─ ' : '  ├─ ';
				items.push({
					label: `${prefix}${subcmd.label}`,
					value: `${cmd.name} ${subcmd.name}`,
				});
			});
		}
	});

	return (
		<Box flexDirection="column" marginLeft={2} borderStyle="round" borderColor="gray" paddingX={1}>
			<SelectInput items={items} onSelect={(item) => onSelect(item.value)} />
		</Box>
	);
}
