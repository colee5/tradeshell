import { Box, Text } from 'ink';
import React from 'react';
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
			<Box>
				<Text color="red">Failed to connect to server. Please try again later.</Text>
			</Box>
		);
	}

	const hasConfig = hasValidConfig(config);
	const isSetup = walletStatus?.isSetup;
	const noWallet = !walletStatus?.walletCount;
	const isUnlocked = walletStatus?.isUnlocked;

	if (!hasConfig) {
		return (
			<Box>
				<Text dimColor>
					No configuration found. Run{' '}
					<Text bold color="cyan">
						/onboard
					</Text>{' '}
					to get started.
				</Text>
			</Box>
		);
	}

	if (!isSetup) {
		return (
			<Box>
				<Text dimColor>
					Wallet not set up. Run{' '}
					<Text bold color="cyan">
						/wallet setup
					</Text>{' '}
					to get started.
				</Text>
			</Box>
		);
	}

	if (!isUnlocked) {
		return (
			<Box>
				<Text dimColor>
					Wallets are locked. Run{' '}
					<Text bold color="cyan">
						/wallet unlock
					</Text>{' '}
					to unlock them.
				</Text>
			</Box>
		);
	}

	if (noWallet) {
		return (
			<Box>
				<Text dimColor>
					No wallets found. Run{' '}
					<Text bold color="cyan">
						/wallet add
					</Text>{' '}
					to add one.
				</Text>
			</Box>
		);
	}
	return null;
}
