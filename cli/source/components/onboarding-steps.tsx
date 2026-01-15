import { Box, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LLM_MODELS, LlmProvider } from '../lib/constants/llm-providers.js';

import { RELOAD_ERROR_CODE } from '../lib/constants/index.js';
import { LlmConfigDto } from '../lib/generated/types.gen.js';
import { useUpdateConfig } from '../lib/hooks/api-hooks.js';

enum OnboardingStep {
	LlmType = 'llm-type',
	Provider = 'provider',
	Model = 'model',
	BaseUrl = 'base-url',
	ApiKey = 'api-key',
	Complete = 'complete',
	Error = 'error',
}

export function OnboardingSteps() {
	const [step, setStep] = useState<OnboardingStep>(OnboardingStep.LlmType);
	const { exit } = useApp();

	const { mutate: updateConfig, error } = useUpdateConfig();

	const { watch, setValue, getValues } = useForm<LlmConfigDto>({
		defaultValues: {
			type: 'cloud',
			provider: undefined,
			model: undefined,
			baseURL: undefined,
			apiKey: undefined,
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

		updateConfig(
			{
				body: {
					llm: data,
				},
			},
			{
				onSuccess: () => {
					setTimeout(() => {
						exit();
						process.exit(RELOAD_ERROR_CODE);
					}, 2000);
				},
				onError: () => {
					setStep(OnboardingStep.Error);
				},
			},
		);
	};

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
				<Box marginTop={1}>
					<Text dimColor>
						You can view your config anytime with{' '}
						<Text bold color="cyan">
							/config get
						</Text>
					</Text>
				</Box>
			</Box>
		);
	}

	if (step === OnboardingStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to save configuration
				</Text>
				<Box marginTop={1}>
					<Text color="red">{error?.message || 'Could not connect to the server'}</Text>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>Please make sure the TradeShell server is running and try again.</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={[{ label: 'Exit', value: 'exit' }]}
						onSelect={() => {
							exit();
						}}
					/>
				</Box>
			</Box>
		);
	}

	return null;
}
