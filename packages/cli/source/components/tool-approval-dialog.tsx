import { Box, Text } from 'ink';
import React from 'react';
import { BORDER_COLOR } from '../lib/constants/colors.js';
import { SelectList } from './select-list.js';

type Props = {
	toolName: string;
	description: string;
	args: Record<string, unknown>;
	onDecision: (approved: boolean) => void;
	counter?: { current: number; total: number };
};

function formatValue(value: unknown): string {
	if (typeof value === 'object') {
		return JSON.stringify(value, null, 2);
	}

	return String(value);
}

export function ToolApprovalDialog({ toolName, description, args, onDecision, counter }: Props) {
	const entries = Object.entries(args);
	const maxKeyLength = Math.max(0, ...entries.map(([key]) => key.length));

	const hasArgs = entries.length > 0;
	const showHeader = toolName !== 'executeCommand';

	return (
		<Box flexDirection="column">
			<Box flexDirection="column" borderStyle="round" borderColor={BORDER_COLOR} paddingX={2}>
				{showHeader && (
					<Text>
						<Text bold>{toolName}</Text>
						{description && <Text color="gray"> — {description}</Text>}
					</Text>
				)}

				{showHeader && hasArgs && <Text> </Text>}

				{entries.map(([key, value]) => (
					<Box key={key} gap={1}>
						<Text color="gray">{key.padEnd(maxKeyLength)}</Text>
						<Text dimColor>→</Text>
						<Text>{formatValue(value)}</Text>
					</Box>
				))}

				{counter && (
					<Box justifyContent="flex-end">
						<Text color="gray">
							{counter.current}/{counter.total}
						</Text>
					</Box>
				)}
			</Box>

			<SelectList
				items={[
					{ label: 'Approve', value: 'approve' },
					{ label: 'Deny', value: 'deny' },
				]}
				onSelect={(item) => {
					onDecision(item.value === 'approve');
				}}
			/>
		</Box>
	);
}
