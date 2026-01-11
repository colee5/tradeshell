import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Onboarding } from '../components/onboarding.js';
import { onboardingCompletedAtom } from '../lib/atoms/onboarding.atom.js';
import { useGetConfig } from '../lib/hooks/api-hooks.js';

export function ConfigCheckerProvider({ children }: { children: React.ReactNode }) {
	const { data: config, isLoading, error } = useGetConfig();
	const onboardingCompleted = useAtomValue(onboardingCompletedAtom);

	if (isLoading) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Loading config...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Text color="red">
				Failed to fetch config from server:{' '}
				{error instanceof Error ? error.message : 'Unknown error'}
			</Text>
		);
	}

	const isConfigEmpty = !config || !config.llm || !config.llm.apiKey;

	if (isConfigEmpty && !onboardingCompleted) {
		return <Onboarding />;
	}

	return <>{children}</>;
}
