import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LLM_MODELS, LlmProvider } from '../lib/constants/llm-providers.js';

import { onboardingCompletedAtom } from '../lib/atoms/onboarding.atom.js';
import { LlmConfigDto } from '../lib/generated/types.gen.js';
import { useUpdateConfig } from '../lib/hooks/api-hooks.js';

enum OnboardingStep {
	Welcome = 'welcome',
	LlmType = 'llm-type',
	Provider = 'provider',
	Model = 'model',
	BaseUrl = 'base-url',
	ApiKey = 'api-key',
	Complete = 'complete',
}

export function Onboarding() {
	const [step, setStep] = useState<OnboardingStep>(OnboardingStep.Welcome);
	const setOnboardingCompleted = useSetAtom(onboardingCompletedAtom);

	const updateConfig = useUpdateConfig();
	const { watch, setValue, getValues } = useForm<LlmConfigDto>({
		defaultValues: {
			type: 'cloud',
			provider: undefined,
			model: undefined,
			baseURL: '',
			apiKey: '',
		},
	});

	const llmType = watch('type');
	const provider = watch('provider');
	const baseURL = watch('baseURL');
	const apiKey = watch('apiKey');

	const saveConfig = async () => {
		const data = getValues();

		if (data.type === 'cloud') {
			if (!data.provider || !data.model || !data.apiKey || data.apiKey.trim() === '') {
				return;
			}
		}

		if (data.type === 'self-hosted' && (!data.baseURL || data.baseURL.trim() === '')) {
			return;
		}

		setStep(OnboardingStep.Complete);

		updateConfig.mutate(
			{
				body: {
					llm: data,
				},
			},
			{
				onSuccess: () => {
					setTimeout(() => {
						setOnboardingCompleted(true);
					}, 1500);
				},
				onError: (error) => {
					console.error('Failed to save config:', error);
				},
			},
		);
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
							setValue('type', item.value as 'cloud' | 'self-hosted');
							if (item.value === 'cloud') {
								setStep(OnboardingStep.Provider);
							} else {
								setStep(OnboardingStep.BaseUrl);
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardingStep.Provider) {
		const providerItems = Object.values(LlmProvider).map((providerValue) => ({
			label: providerValue.charAt(0).toUpperCase() + providerValue.slice(1),
			value: providerValue,
		}));

		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Choose your cloud provider:
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={providerItems}
						onSelect={(item) => {
							setValue('provider', item.value as LlmProvider);
							setStep(OnboardingStep.Model);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === OnboardingStep.Model) {
		const selectedProvider = provider as LlmProvider;
		const availableModels = selectedProvider ? LLM_MODELS[selectedProvider] : [];
		const modelItems = availableModels.map((modelName: string) => ({
			label: modelName,
			value: modelName,
		}));

		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Choose your model:
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={modelItems}
						onSelect={(item) => {
							setValue('model', item.value);
							setStep(OnboardingStep.ApiKey);
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
								saveConfig();
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
						value={apiKey || ''}
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
