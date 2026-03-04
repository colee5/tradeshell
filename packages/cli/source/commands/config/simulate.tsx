import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useRef } from 'react';
import { SelectList } from '../../components/select-list.js';
import { useGetConfig, useUpdateSimulateTransactions } from '../../lib/hooks/config-hooks.js';
import { replaceCommandLogEntryAtom } from '../../lib/store/command-log.atom.js';

type Props = {
	readonly entryId: string;
};

const items = [
	{ label: 'on', value: true, description: 'Estimate gas before confirming transactions' },
	{ label: 'off', value: false, description: 'Execute transactions without simulation' },
];

export function ConfigSimulate({ entryId }: Props) {
	const { data: config, isLoading } = useGetConfig();
	const { mutate, isPending, isSuccess, isError, error, variables } =
		useUpdateSimulateTransactions();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasReplaced = useRef(false);

	const handleSelect = useCallback(
		(item: { value: boolean }) => {
			mutate({ enabled: item.value });
		},
		[mutate],
	);

	useEffect(() => {
		if (hasReplaced.current) return;

		if (isSuccess) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
					<Text>
						Transaction simulation{' '}
						<Text color={variables?.enabled ? 'green' : 'red'}>
							{variables?.enabled ? 'enabled' : 'disabled'}
						</Text>
					</Text>
				),
			});
		}

		if (isError) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
					<Text color="red">
						Failed to update simulation mode:{' '}
						{error instanceof Error ? error.message : 'Unknown error'}
					</Text>
				),
			});
		}
	}, [isSuccess, isError, error, variables, replaceEntry, entryId]);

	if (isLoading || isPending) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>{isPending ? 'Updating...' : 'Loading...'}</Text>
			</Box>
		);
	}

	if (!config) return null;

	const currentFirst = config.simulateTransactions
		? items
		: [...items].reverse();

	return (
		<Box flexDirection="column">
			<Text bold>Transaction simulation</Text>
			<SelectList items={currentFirst} onSelect={handleSelect} />
		</Box>
	);
}
