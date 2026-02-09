import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import React from 'react';
import { useGetWalletStatus } from '../../lib/hooks/api-hooks.js';

export function WalletStatus() {
	const { data: walletStatus, error, isLoading } = useGetWalletStatus();
	const stringifiedStatus = JSON.stringify(walletStatus, null, 2);

	if (isLoading) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Loading wallet status...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Text color="red">
				Failed to fetch wallet status: {error instanceof Error ? error.message : 'Unknown error'}
			</Text>
		);
	}

	if (!walletStatus) {
		return <Text>No wallet status available</Text>;
	}

	return (
		<Text>
			<SyntaxHighlight code={stringifiedStatus} />
		</Text>
	);
}
