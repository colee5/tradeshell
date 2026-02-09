import { Newline, Text } from 'ink';
import React from 'react';
import { WalletSubcommands } from '../../lib/commands.js';

type Props = {
	args: string[];
};

export function Wallet({ args }: Props) {
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

	// if (subcommand === WalletSubcommands.ADD) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.DELETE) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.LIST) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.LOCK) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.UNLOCK) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.PASSWORD) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.SETUP) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.STATUS) {
	// 	return <ConfigGet />;
	// }

	// if (subcommand === WalletSubcommands.SWITCH) {
	// 	return <ConfigGet />;
	// }

	return (
		<Text color="yellow">
			Unknown subcommand: {subcommand}
			<Newline />
			Available subcommands: {Object.values(WalletSubcommands).join(', ')}
		</Text>
	);
}
