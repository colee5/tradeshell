import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';

import { BlockchainConfigDto } from '../../lib/generated/types.gen.js';
import { CHAIN_OPTIONS } from '../../lib/constants/chains.js';
import { useUpdateBlockchainConfig } from '../../lib/hooks/api-hooks.js';

enum BlockchainOnboardingStep {
	ChainSelect = 'chain-select',
	RpcUrl = 'rpc-url',
	Saving = 'saving',
	Complete = 'complete',
	Error = 'error',
}

export function BlockchainOnboarding({ onComplete }: { onComplete: () => void }) {
	const [step, setStep] = useState<BlockchainOnboardingStep>(BlockchainOnboardingStep.ChainSelect);
	const [chainId, setChainId] = useState<BlockchainConfigDto['chainId']>(1);
	const [rpcUrl, setRpcUrl] = useState('');
	const { mutate: updateBlockchainConfig, error } = useUpdateBlockchainConfig();

	const saveConfig = (config: BlockchainConfigDto) => {
		setStep(BlockchainOnboardingStep.Saving);
		updateBlockchainConfig(
			{
				body: config,
			},
			{
				onSuccess: () => {
					setStep(BlockchainOnboardingStep.Complete);
					setTimeout(() => {
						onComplete();
					}, 2000);
				},
				onError: () => {
					setStep(BlockchainOnboardingStep.Error);
				},
			},
		);
	};

	if (step === BlockchainOnboardingStep.ChainSelect) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Choose your blockchain network:
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={CHAIN_OPTIONS}
						onSelect={(item) => {
							setChainId(item.value);
							setStep(BlockchainOnboardingStep.RpcUrl);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === BlockchainOnboardingStep.RpcUrl) {
		const selectedChain = CHAIN_OPTIONS.find((c) => c.value === chainId);
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter a custom RPC URL for {selectedChain?.label}:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Press Enter to skip and use the default RPC</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>RPC URL: </Text>
					<TextInput
						value={rpcUrl}
						onChange={setRpcUrl}
						onSubmit={() => {
							const config: BlockchainConfigDto = { chainId };
							if (rpcUrl.trim() !== '') {
								config.rpcUrl = rpcUrl.trim();
							}

							saveConfig(config);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === BlockchainOnboardingStep.Saving) {
		return (
			<Box flexDirection="row" gap={1} paddingX={2} paddingY={1}>
				<Spinner />
				<Text>Saving blockchain configuration...</Text>
			</Box>
		);
	}

	if (step === BlockchainOnboardingStep.Complete) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="green">
					✓ Blockchain setup complete!
				</Text>
			</Box>
		);
	}

	if (step === BlockchainOnboardingStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to save blockchain configuration
				</Text>
				<Box marginTop={1}>
					<Text color="red">{error?.message || 'Could not connect to the server'}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{ label: 'Retry', value: 'retry' },
							{ label: 'Skip', value: 'skip' },
						]}
						onSelect={(item) => {
							if (item.value === 'retry') {
								setStep(BlockchainOnboardingStep.ChainSelect);
							} else {
								onComplete();
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	return null;
}
