import { Box, Text } from 'ink';
import React from 'react';
import { PRIMARY_COLOR } from '../lib/constants/colors.js';
import { useGetConfig } from '../lib/hooks/config-hooks.js';
import { useGetWalletStatus } from '../lib/hooks/wallet-hooks.js';
import { hasValidConfig } from '../lib/utils.js';

export function InitialOnboardingPrompt() {
	const { data: config, isLoading: isConfigLoading, isError: isConfigError } = useGetConfig();
	const {
		data: walletStatus,
		isLoading: isWalletLoading,
		isError: isWalletError,
	} = useGetWalletStatus();

	if (isConfigLoading || isWalletLoading) {
		return null;
	}

	if (isConfigError || isWalletError) {
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

	const hasConfig = hasValidConfig(config);
	const isSetup = walletStatus?.isSetup;
	const noWallet = !walletStatus?.walletCount;
	const isUnlocked = walletStatus?.isUnlocked;

	// If no config, show onboard prompt (which handles wallet setup too)
	if (!hasConfig) {
		return (
			<Box
				flexDirection="column"
				paddingX={2}
				paddingY={1}
				borderStyle="round"
				borderColor="yellow"
			>
				<Text bold color="yellow">
					⚠ No configuration found
				</Text>
				<Box marginTop={1}>
					<Text>You need to set up your configuration before using TradeShell.</Text>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>
						Run{' '}
						<Text bold color="cyan">
							/onboard
						</Text>{' '}
						to get started.
					</Text>
				</Box>
			</Box>
		);
	}

	// Config exists but wallet system not set up
	if (!isSetup) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					⚠ Wallet system not set up
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

	// Wallet system is set up but no wallets exist
	if (noWallet) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					⚠ No wallets found
				</Text>
				<Box marginTop={1}>
					<Text dimColor>
						Run{' '}
						<Text bold color="cyan">
							/wallet add
						</Text>{' '}
						to add a wallet.
					</Text>
				</Box>
			</Box>
		);
	}

	// Wallet is set up but locked
	if (!isUnlocked) {
		return (
			<Box
				flexDirection="column"
				paddingX={2}
				paddingY={1}
				borderStyle="round"
				borderColor="yellow"
			>
				<Text bold color={PRIMARY_COLOR}>
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

	// All good - no prompt needed
	return null;
}
