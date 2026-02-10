import { Newline, Text } from 'ink';
import React from 'react';
import { ConfigSubcommands } from '../../lib/commands.js';
import { ConfigGet } from './get.js';
import { ConfigReset } from './reset.js';

type Props = {
	args: string[];
};

export function Config({ args }: Props) {
	const subcommand = args[0];

	// If no subcommand, show help message
	if (!subcommand) {
		return (
			<Text dimColor>
				Please use{' '}
				<Text bold color="cyan">
					/help
				</Text>{' '}
				to see available config options.
			</Text>
		);
	}

	if (subcommand === ConfigSubcommands.GET) {
		return <ConfigGet />;
	}

	if (subcommand === ConfigSubcommands.RESET) {
		return <ConfigReset />;
	}

	return (
		<Text color="yellow">
			Unknown subcommand: {subcommand}
			<Newline />
			Available subcommands: {Object.values(ConfigSubcommands).join(', ')}
		</Text>
	);
}
