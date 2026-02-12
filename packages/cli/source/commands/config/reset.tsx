import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { useResetConfig } from '../../lib/hooks/config-hooks.js';
import { replaceCommandLogEntryAtom } from '../../lib/store/command-log.atom.js';

type Props = {
	input: string;
	entryId: string;
};

export function ConfigReset({ entryId }: Props) {
	const { mutate, isPending, isSuccess, isError, error } = useResetConfig();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasReplaced = useRef(false);

	useEffect(() => {
		mutate();
	}, []);

	useEffect(() => {
		if (hasReplaced.current) return;

		if (isSuccess) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: <Text color="green">Config reset to default values successfully!</Text>,
			});
		}

		if (isError) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
					<Text color="red">
						Failed to reset config: {error instanceof Error ? error.message : 'Unknown error'}
					</Text>
				),
			});
		}
	}, [isSuccess, isError, error]);

	if (isPending) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Resetting config...</Text>
			</Box>
		);
	}

	return null;
}
