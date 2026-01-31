import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import React, { useEffect, useState } from 'react';

import { useGetConfig, useResetConfig } from '../lib/hooks/api-hooks.js';
import { LlmOnboarding } from '../components/onboard/llm-onboarding.js';
import { useModal } from '../lib/hooks/use-modal.js';

enum OnboardStep {
	CheckingConfig = 'checking',
	ShowConfirmation = 'confirmation',
	Resetting = 'resetting',
	Onboarding = 'onboarding',
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
			const hasValidConfig = config && config.llm;

			if (hasValidConfig) {
				setStep(OnboardStep.ShowConfirmation);
			} else {
				setStep(OnboardStep.Onboarding);
			}
		}
	}, [isLoading, config, hasCheckedInitialConfig]);

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
											setStep(OnboardStep.Onboarding);
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

	if (step === OnboardStep.Onboarding) {
		return <LlmOnboarding />;
	}

	return null;
}
