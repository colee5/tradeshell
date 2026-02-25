import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { useGetWalletStatus } from '../../lib/hooks/wallet-hooks.js';
import { replaceCommandLogEntryAtom } from '../../lib/store/command-log.atom.js';

type Props = {
	input: string;
	entryId: string;
};

export function WalletStatus({ entryId }: Props) {
	const { data: walletStatus, error } = useGetWalletStatus();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasReplaced = useRef(false);

	useEffect(() => {
		if (hasReplaced.current) return;

		if (walletStatus) {
			hasReplaced.current = true;
			const stringifiedStatus = JSON.stringify(walletStatus, null, 2);
			replaceEntry({
				id: entryId,
				output: (
					<Text>
						<SyntaxHighlight code={stringifiedStatus} />
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
						Failed to fetch wallet status:{' '}
						{error instanceof Error ? error.message : 'Unknown error'}
					</Text>
				),
			});
		}
	}, [walletStatus, error]);

	return (
		<Box flexDirection="row" gap={1}>
			<Spinner />
			<Text>Loading wallet status...</Text>
		</Box>
	);
}
