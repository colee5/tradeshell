import { Box, Text } from 'ink';
import React from 'react';
import { COMMANDS } from '../lib/commands.js';

export function Help() {
	return (
		<Box flexDirection="column" gap={0.5}>
			<Text bold color="cyan">
				TradeShell Commands
			</Text>

			<Box flexDirection="column">
				<Text bold color="green">
					{COMMANDS.onboard.label}
				</Text>
				<Text dimColor> Start the onboarding process to configure TradeShell</Text>
			</Box>

			<Box flexDirection="column">
				<Text bold color="green">
					{COMMANDS.config.label}
				</Text>
				<Text dimColor> Manage your configuration</Text>
				<Box marginLeft={2} flexDirection="column">
					<Text>
						<Text color="cyan">/config get</Text>
						<Text dimColor> - Display current configuration</Text>
					</Text>
					<Text>
						<Text color="cyan">/config reset</Text>
						<Text dimColor> - Reset configuration to defaults</Text>
					</Text>
				</Box>
			</Box>

			<Box flexDirection="column">
				<Text bold color="green">
					{COMMANDS.help.label}
				</Text>
				<Text dimColor> Show this help message</Text>
			</Box>

			<Box flexDirection="column">
				<Text bold color="green">
					{COMMANDS.exit.label}
				</Text>
				<Text dimColor> Exit TradeShell</Text>
			</Box>

			<Box marginTop={1}>
				<Text dimColor>Tip: Type / to see command suggestions</Text>
			</Box>
		</Box>
	);
}
