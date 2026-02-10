import { Box, Text } from 'ink';
import React from 'react';
import { useGetWalletStatus } from '../lib/hooks/wallet-hooks';

export function InitialWalletPrompt() {
	const { data: walletStatus, isLoading, isError } = useGetWalletStatus();
	const isSetup = walletStatus?.isSetup;
	const noWallet = !walletStatus?.walletCount;

	if (isLoading) {
		return null;
	}

	if (isSetup && !noWallet && !isError && walletStatus?.isUnlocked) {
		return null;
	}

	if (isSetup && !noWallet && !isError && !walletStatus?.isUnlocked) {
		return (
			<Box
				flexDirection="column"
				paddingX={2}
				paddingY={1}
				borderStyle="round"
				borderColor="yellow"
			>
				<Text bold color="yellow">
					Wallets are locked
				</Text>
				<Box marginTop={1}>
					<Text dimColor>
						Run{' '}
						<Text bold color="cyan">
							/wallet unlock
						</Text>{' '}
						to unlock them.
					</Text>
				</Box>
			</Box>
		);
	}

	if (isError) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					Failed to receive response from the server
				</Text>

				<Box>
					<Text dimColor>Please try again later</Text>
				</Box>
			</Box>
		);
	}

	if (noWallet) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					No wallets in your account, please add a wallet with /wallet add
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
			<Text bold color="red">
				⚠ No Wallet found
			</Text>
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
