import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { BlockchainConfigDto } from '../../lib/generated/types.gen.js';
import { useGetChains, useUpdateBlockchainConfig } from '../../lib/hooks/api-hooks.js';
import { SetupComplete } from './setup-complete.js';

enum BlockchainOnboardingStep {
	ChainSelect = 'chain-select',
	RpcUrl = 'rpc-url',
	Complete = 'complete',
	Error = 'error',
}

export function BlockchainOnboarding({ onComplete }: { onComplete: () => void }) {
	const [step, setStep] = useState<BlockchainOnboardingStep>(BlockchainOnboardingStep.ChainSelect);
	const { data: supportedChains, isLoading } = useGetChains();
	const { mutate: updateBlockchainConfig, error } = useUpdateBlockchainConfig();

	const { watch, setValue, getValues } = useForm<BlockchainConfigDto>({
		defaultValues: {
			chainId: undefined,
			rpcUrl: undefined,
		},
	});

	const chainId = watch('chainId');
	const rpcUrl = watch('rpcUrl');

	const saveConfig = async () => {
		const data = getValues();

		if (!data.chainId) {
			return;
		}

		setStep(BlockchainOnboardingStep.Complete);

		updateBlockchainConfig(
			{
				body: data,
			},
			{
				onSuccess: () => {
					setTimeout(() => {
						onComplete();
					}, SETUP_COMPLETE_TIMEOUT_MS);
				},
				onError: () => {
					setStep(BlockchainOnboardingStep.Error);
				},
			},
		);
	};

	if (step === BlockchainOnboardingStep.ChainSelect) {
		if (isLoading || !supportedChains) {
			return (
				<Box flexDirection="row" gap={1} paddingX={2} paddingY={1}>
					<Spinner />
					<Text>Loading supported chains...</Text>
				</Box>
			);
		}

		const chainOptions = supportedChains.chains.map((chain) => ({
			label: chain.name,
			value: chain.id,
		}));

		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Choose your blockchain network:
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={chainOptions}
						onSelect={(item) => {
							setValue('chainId', item.value as BlockchainConfigDto['chainId']);
							setStep(BlockchainOnboardingStep.RpcUrl);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === BlockchainOnboardingStep.RpcUrl) {
		const selectedChain = supportedChains?.chains.find((c) => c.id === chainId);
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter a custom RPC URL for {selectedChain?.name}:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Press Enter to skip and use the default RPC</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>RPC URL: </Text>
					<TextInput
						value={rpcUrl || ''}
						onChange={(value) => setValue('rpcUrl', value)}
						onSubmit={saveConfig}
					/>
				</Box>
			</Box>
		);
	}

	if (step === BlockchainOnboardingStep.Complete) {
		return <SetupComplete message="Onboarding fully completed, redirecting shortly" />;
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
