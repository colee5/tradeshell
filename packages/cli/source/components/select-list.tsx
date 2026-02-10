import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { PRIMARY_COLOR } from '../lib/constants/colors.js';

export type SelectListItem<V = string> = {
	label: string;
	value: V;
	description?: string;
};

type Props<V> = {
	items: Array<SelectListItem<V>>;
	limit?: number;
	onSelect: (item: SelectListItem<V>) => void;
	onHighlight?: (item: SelectListItem<V>) => void;
};

function Item({
	isSelected,
	label,
	description,
	labelWidth,
}: {
	isSelected?: boolean;
	label: string;
	description?: string;
	labelWidth?: number;
}) {
	const padded = labelWidth ? label.padEnd(labelWidth) : label;
	return (
		<Box>
			<Text color={isSelected ? PRIMARY_COLOR : undefined}>{padded}</Text>
			{description && <Text color="gray"> {description}</Text>}
		</Box>
	);
}

export function SelectList<V>({ items, limit, onSelect, onHighlight }: Props<V>) {
	const hasDescriptions = items.some((item) => item.description);
	const maxLabelWidth = hasDescriptions ? Math.max(...items.map((item) => item.label.length)) : 0;

	const enrichedItems = hasDescriptions
		? items.map((item) => ({ ...item, labelWidth: maxLabelWidth }))
		: items;

	return (
		<SelectInput
			items={enrichedItems}
			limit={limit}
			indicatorComponent={() => null}
			itemComponent={Item}
			onSelect={onSelect}
			onHighlight={onHighlight}
		/>
	);
}
