import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';
import { useGetWalletList } from '../../lib/hooks/api-hooks.js';

export function WalletList() {
	const { data: walletList, error, isLoading } = useGetWalletList();

	if (isLoading) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Loading wallets...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Text color="red">
				Failed to fetch wallets: {error instanceof Error ? error.message : 'Unknown error'}
			</Text>
		);
	}

	if (!walletList?.wallets.length) {
		return <Text dimColor>No wallets found. Use /wallet add to add one.</Text>;
	}

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={2} paddingY={1}>
			{walletList.wallets.map((wallet) => (
				<Box key={wallet.address} flexDirection="row" gap={1}>
					<Text color="white">{wallet.name}</Text>
					<Text dimColor>{wallet.address}</Text>
					{wallet.isActive && <Text color="red">(active)</Text>}
				</Box>
			))}
		</Box>
	);
}
