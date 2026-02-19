import { Newline, Text } from 'ink';
import React from 'react';
import { ConfigSubcommands } from '../../lib/commands.js';
import { ConfigGet } from './get.js';
import { ConfigReset } from './reset.js';

type Props = {
	args: string[];
	input: string;
	entryId: string;
};

export function Config({ args, input, entryId }: Props) {
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
		return <ConfigGet input={input} entryId={entryId} />;
	}

	if (subcommand === ConfigSubcommands.RESET) {
		return <ConfigReset input={input} entryId={entryId} />;
	}

	return (
		<Text color="yellow">
			Unknown subcommand: {subcommand}
			<Newline />
			Available subcommands: {Object.values(ConfigSubcommands).join(', ')}
		</Text>
	);
}
