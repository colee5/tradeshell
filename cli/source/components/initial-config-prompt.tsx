import { Box, Text } from 'ink';
import React from 'react';
import { useGetConfig } from '../lib/hooks/api-hooks.js';

export function InitialConfigPrompt() {
	const { data: config, isLoading } = useGetConfig();

	if (isLoading) {
		return null;
	}

	const hasConfig = config && config.llm;

	if (hasConfig) {
		return null;
	}

	return (
		<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="yellow">
			<Text bold color="yellow">
				⚠ No configuration found
			</Text>
			<Box marginTop={1}>
				<Text>You need to set up your configuration before using TradeShell.</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					Run{' '}
					<Text bold color="cyan">
						/onboard
					</Text>{' '}
					to get started.
				</Text>
			</Box>
		</Box>
	);
}
