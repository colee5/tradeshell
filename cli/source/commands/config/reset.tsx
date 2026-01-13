import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';
import { useResetConfig } from '../../lib/hooks/api-hooks.js';

export function ConfigReset() {
	const { mutate, isPending, isSuccess, isError, error } = useResetConfig();

	React.useEffect(() => {
		mutate({});
	}, []);

	if (isPending) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Resetting config...</Text>
			</Box>
		);
	}

	if (isError) {
		return (
			<Text color="red">
				Failed to reset config: {error instanceof Error ? error.message : 'Unknown error'}
			</Text>
		);
	}

	if (isSuccess) {
		return <Text color="green">Config reset to default values successfully!</Text>;
	}

	return null;
}
