import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import React, { useEffect, useState } from 'react';

import { BlockchainOnboarding } from '../components/onboard/blockchain-onboarding.js';
import { LlmOnboarding } from '../components/onboard/llm-onboarding.js';
import { useGetConfig, useResetConfig } from '../lib/hooks/api-hooks.js';
import { useModal } from '../lib/hooks/use-modal.js';
import { hasValidConfig } from '../lib/utils.js';

enum OnboardStep {
	CheckingConfig = 'checking',
	ShowConfirmation = 'confirmation',
	Resetting = 'resetting',
	LlmOnboarding = 'llm-onboarding',
	AskBlockchain = 'ask-blockchain',
	BlockchainOnboarding = 'blockchain-onboarding',
}

export function Onboard() {
	const [step, setStep] = useState<OnboardStep>(OnboardStep.CheckingConfig);
	const [hasCheckedInitialConfig, setHasCheckedInitialConfig] = useState(false);
	const { data: config, isLoading } = useGetConfig();
	const { mutate: resetConfig, isPending: isResetting } = useResetConfig();
	const modal = useModal();

	// Check if config exists and is valid
	useEffect(() => {
		if (!isLoading && !hasCheckedInitialConfig) {
			setHasCheckedInitialConfig(true);
			if (hasValidConfig(config)) {
				setStep(OnboardStep.ShowConfirmation);
			} else {
				setStep(OnboardStep.LlmOnboarding);
			}
		}
	}, [isLoading, config, hasCheckedInitialConfig]);

	const handleLlmComplete = () => {
		setStep(OnboardStep.AskBlockchain);
	};

	const handleBlockchainComplete = () => {
		modal.dismiss();
	};

	if (isLoading || step === OnboardStep.CheckingConfig) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Checking configuration...</Text>
			</Box>
		);
	}

	if (step === OnboardStep.ShowConfirmation && config) {
		return (
			<Box flexDirection="column" gap={1}>
				<Text bold color="yellow">
					You already have a configuration:
				</Text>
				<Box marginTop={1}>
					<SyntaxHighlight code={JSON.stringify({ ...config }, null, 2)} language="json" />
				</Box>
				<Box marginTop={1}>
					<Text bold color="cyan">
						Do you want to reset and onboard again?
					</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{ label: 'Yes, reset and start onboarding', value: 'yes' },
							{ label: 'No, keep current configuration', value: 'no' },
						]}
						onSelect={(item) => {
							if (item.value === 'yes') {
								setStep(OnboardStep.Resetting);
								resetConfig(
									{},
									{
										onSuccess: () => {
											setStep(OnboardStep.LlmOnboarding);
										},
									},
								);
							} else {
								modal.dismiss();
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardStep.Resetting || isResetting) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Resetting configuration...</Text>
			</Box>
		);
	}

	if (step === OnboardStep.LlmOnboarding) {
		return <LlmOnboarding onComplete={handleLlmComplete} />;
	}

	if (step === OnboardStep.AskBlockchain) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Would you like to set up blockchain configuration?
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{ label: 'Yes, set up blockchain', value: 'yes' },
							{ label: 'No, skip for now', value: 'no' },
						]}
						onSelect={(item) => {
							if (item.value === 'yes') {
								setStep(OnboardStep.BlockchainOnboarding);
							} else {
								modal.dismiss();
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardStep.BlockchainOnboarding) {
		return <BlockchainOnboarding onComplete={handleBlockchainComplete} />;
	}

	return null;
}
