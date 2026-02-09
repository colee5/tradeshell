import { Box, Text } from 'ink';
import React from 'react';
import { useGetWalletStatus } from '../lib/hooks/api-hooks.js';

export function InitialWalletPrompt() {
	const { data: walletStatus, isLoading, isError } = useGetWalletStatus();
	const isSetup = walletStatus?.isSetup;

	if (isLoading) {
		return null;
	}

	if (isSetup && !isError) {
		return null;
	}

	if (isError) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					Failed to receive response from the server
				</Text>

				<Box marginTop={0.3}>
					<Text dimColor>Please try again later</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="yellow">
			<Text bold color="yellow">
				⚠ No Wallet found
			</Text>
			<Box marginTop={1}>
				<Text>You need to set up wallet configuration before using TradeShell.</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					Run{' '}
					<Text bold color="cyan">
						/wallet setup
					</Text>{' '}
					to get started.
				</Text>
			</Box>
		</Box>
	);
}
