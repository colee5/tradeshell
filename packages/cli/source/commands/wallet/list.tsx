import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { useGetWalletList } from '../../lib/hooks/wallet-hooks.js';
import { replaceCommandLogEntryAtom } from '../../lib/store/command-log.atom.js';

type Props = {
	input: string;
	entryId: string;
};

export function WalletList({ entryId }: Props) {
	const { data: walletList, error } = useGetWalletList();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasReplaced = useRef(false);

	useEffect(() => {
		if (hasReplaced.current) return;

		if (walletList) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: walletList.wallets.length ? (
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="gray"
						paddingX={2}
						paddingY={1}
					>
						{walletList.wallets.map((wallet) => (
							<Box key={wallet.address} flexDirection="row" gap={1}>
								<Text color="white">{wallet.name}</Text>
								<Text dimColor>{wallet.address}</Text>
								{wallet.isActive && <Text color="red">(active)</Text>}
							</Box>
						))}
					</Box>
				) : (
					<Text dimColor>No wallets found. Use /wallet add to add one.</Text>
				),
			});
		}

		if (error) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
					<Text color="red">
						Failed to fetch wallets: {error instanceof Error ? error.message : 'Unknown error'}
					</Text>
				),
			});
		}
	}, [walletList, error]);

	return (
		<Box flexDirection="row" gap={1}>
			<Spinner />
			<Text>Loading wallets...</Text>
		</Box>
	);
}
