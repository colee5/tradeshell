import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { useGetConfig } from '../../lib/hooks/config-hooks.js';
import { replaceCommandLogEntryAtom } from '../../lib/store/command-log.atom.js';

type Props = {
	input: string;
	entryId: string;
};

export function ConfigGet({ entryId }: Props) {
	const { data: config, error } = useGetConfig();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasReplaced = useRef(false);

	useEffect(() => {
		if (hasReplaced.current) return;

		if (config) {
			hasReplaced.current = true;
			const stringifiedConfig = JSON.stringify(config, null, 2);
			replaceEntry({
				id: entryId,
				output: (
					<Text>
						<SyntaxHighlight code={stringifiedConfig} />
					</Text>
				),
			});
		}

		if (error) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
					<Text color="red">
						Failed to fetch config from server:{' '}
						{error instanceof Error ? error.message : 'Unknown error'}
					</Text>
				),
			});
		}
	}, [config, error]);

	return (
		<Box flexDirection="row" gap={1}>
			<Spinner />
			<Text>Loading config...</Text>
		</Box>
	);
}
