import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { onboardingCompletedAtom } from '../lib/atoms/onboarding.atom.js';
import { onboardingFormSchema, type OnboardingFormData } from '../lib/schemas/onboarding.schema.js';

enum OnboardingStep {
	Welcome = 'welcome',
	LlmType = 'llm-type',
	BaseUrl = 'base-url',
	ApiKey = 'api-key',
	Complete = 'complete',
}

export function Onboarding() {
	const [step, setStep] = useState<OnboardingStep>(OnboardingStep.Welcome);
	const setOnboardingCompleted = useSetAtom(onboardingCompletedAtom);
	const { watch, setValue, getValues } = useForm<OnboardingFormData>({
		resolver: zodResolver(onboardingFormSchema),
		defaultValues: {
			llmType: 'cloud',
			baseURL: '',
			apiKey: '',
		},
	});

	const llmType = watch('llmType');
	const baseURL = watch('baseURL');
	const apiKey = watch('apiKey');

	const saveConfig = async () => {
		const data = getValues();

		if (!data.apiKey || data.apiKey.trim() === '') {
			return;
		}

		if (data.llmType === 'self-hosted' && (!data.baseURL || data.baseURL.trim() === '')) {
			return;
		}

		// TODO: Save config to server
		console.log('Config saved:', data);
		setStep(OnboardingStep.Complete);

		setTimeout(() => {
			setOnboardingCompleted(true);
		}, 1500);
	};

	if (step === OnboardingStep.Welcome) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Welcome to TradeShell!
				</Text>
				<Text dimColor>Let's get you set up in a few quick steps.</Text>
				<Box marginTop={1}>
					<Text dimColor>Press Enter to continue...</Text>
				</Box>
				<TextInput value="" onChange={() => {}} onSubmit={() => setStep(OnboardingStep.LlmType)} />
			</Box>
		);
	}

	if (step === OnboardingStep.LlmType) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Choose your LLM provider:
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{ label: 'Cloud (Anthropic, OpenAI, etc.)', value: 'cloud' },
							{ label: 'Self-hosted', value: 'self-hosted' },
						]}
						onSelect={(item) => {
							setValue('llmType', item.value as 'cloud' | 'self-hosted');
							if (item.value === 'cloud') {
								setStep(OnboardingStep.ApiKey);
							} else {
								setStep(OnboardingStep.BaseUrl);
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardingStep.BaseUrl) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter your self-hosted LLM base URL:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Example: http://localhost:11434</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>Base URL: </Text>
					<TextInput
						value={baseURL || ''}
						onChange={(value) => setValue('baseURL', value)}
						onSubmit={() => {
							if (baseURL && baseURL.trim() !== '') {
								setStep(OnboardingStep.ApiKey);
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardingStep.ApiKey) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter your API key:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>
						{llmType === 'cloud'
							? 'This will be used to authenticate with your cloud provider'
							: 'This will be used to authenticate with your self-hosted instance'}
					</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>API Key: </Text>
					<TextInput
						value={apiKey}
						onChange={(value) => setValue('apiKey', value)}
						onSubmit={saveConfig}
						mask="*"
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardingStep.Complete) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="green">
					✓ Setup complete!
				</Text>
				<Box flexDirection="row" gap={1} marginTop={1}>
					<Spinner />
					<Text dimColor>Saving your configuration...</Text>
				</Box>
			</Box>
		);
	}

	return null;
}
