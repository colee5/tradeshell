import { Box } from 'ink';
import React, { useMemo } from 'react';
import { AVAILABLE_COMMANDS } from '../lib/commands.js';
import { SelectList } from './select-list.js';

type Props = {
	input: string;
	onSelect: (value: string) => void;
};

const MAX_SUGGESTIONS = 6;

function buildAllItems() {
	const items: Array<{ label: string; value: string; description: string }> = [];

	for (const cmd of AVAILABLE_COMMANDS) {
		items.push({ label: `/${cmd.name}`, value: `/${cmd.name}`, description: cmd.description });

		if ('subcommands' in cmd && cmd.subcommands) {
			for (const subcmd of cmd.subcommands) {
				items.push({
					label: `/${cmd.name} ${subcmd.label}`,
					value: `/${cmd.name} ${subcmd.name}`,
					description: subcmd.description,
				});
			}
		}
	}

	return items;
}

const allItems = buildAllItems();

export function CommandSuggestions({ input, onSelect }: Props) {
	const filtered = useMemo(() => {
		if (!input.startsWith('/')) return [];

		const query = input.toLowerCase();

		return allItems.filter((item) => item.value.toLowerCase().startsWith(query));
	}, [input]);

	if (filtered.length === 0) return null;

	return (
		<Box flexDirection="column" paddingX={1}>
			<SelectList
				items={filtered}
				limit={MAX_SUGGESTIONS}
				onSelect={(item) => onSelect(item.value)}
			/>
		</Box>
	);
}
