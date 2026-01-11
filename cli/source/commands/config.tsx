import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SyntaxHighlight from 'ink-syntax-highlight';
import React from 'react';
import { useGetConfig } from '../lib/hooks/api-hooks.js';

export function Config() {
	const { data: config, error, isLoading } = useGetConfig();
	const stringifiedConfig = JSON.stringify(config, null, 2);

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

	if (!config) {
		return <Text>No config data available</Text>;
	}

	return (
		<Text>
			<SyntaxHighlight code={stringifiedConfig} />
		</Text>
	);
}
