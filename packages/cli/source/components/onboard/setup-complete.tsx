import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';

interface SetupCompleteProps {
	message?: string;
	showSpinner?: boolean;
	spinnerText?: string;
	helpText?: string;
	helpCommand?: string;
}

export function SetupComplete({
	message = '✓ Setup complete!',
	showSpinner = true,
	spinnerText = 'Saving your configuration...',
}: SetupCompleteProps) {
	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Text bold color="green">
				{message}
			</Text>
			{showSpinner && (
				<Box flexDirection="row" gap={1} marginTop={1}>
					<Spinner />
					<Text dimColor>{spinnerText}</Text>
				</Box>
			)}
		</Box>
	);
}
