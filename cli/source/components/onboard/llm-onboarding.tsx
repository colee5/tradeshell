import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LLM_MODELS, LlmProvider } from '../../lib/constants/llm-providers.js';

import { LlmConfigDto } from '../../lib/generated/types.gen.js';
import { useUpdateLlmConfig } from '../../lib/hooks/api-hooks.js';
import { SetupComplete } from './setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';

enum LlmOnboardingStep {
	LlmType = 'llm-type',
	Provider = 'provider',
	Model = 'model',
	BaseUrl = 'base-url',
	ApiKey = 'api-key',
	Complete = 'complete',
	Error = 'error',
}

export function LlmOnboarding({ onComplete }: { onComplete: () => void }) {
	const [step, setStep] = useState<LlmOnboardingStep>(LlmOnboardingStep.LlmType);
	const { mutate: updateLlmConfig, error } = useUpdateLlmConfig();

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

		// Validation checks
		if (data.type === 'cloud') {
			if (!data.provider || !data.model || !data.apiKey || data.apiKey.trim() === '') {
				return;
			}
		}

		if (data.type === 'self-hosted' && (!data.baseURL || data.baseURL.trim() === '')) {
			return;
		}

		setStep(LlmOnboardingStep.Complete);

		updateLlmConfig(
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
					setStep(LlmOnboardingStep.Error);
				},
			},
		);
	};

	if (step === LlmOnboardingStep.LlmType) {
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
								setStep(LlmOnboardingStep.Provider);
							} else {
								setStep(LlmOnboardingStep.BaseUrl);
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === LlmOnboardingStep.Provider) {
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
							setStep(LlmOnboardingStep.Model);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === LlmOnboardingStep.Model) {
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
							setStep(LlmOnboardingStep.ApiKey);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === LlmOnboardingStep.BaseUrl) {
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

	if (step === LlmOnboardingStep.ApiKey) {
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

	if (step === LlmOnboardingStep.Complete) {
		return <SetupComplete />;
	}

	if (step === LlmOnboardingStep.Error) {
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
							onComplete();
						}}
					/>
				</Box>
			</Box>
		);
	}

	return null;
}
