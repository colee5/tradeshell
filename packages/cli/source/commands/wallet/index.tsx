import { Newline, Text } from 'ink';
import React from 'react';
import { WalletSubcommands } from '../../lib/commands.js';
import { WalletList } from './list.js';
import { WalletLock } from './lock.js';
import { WalletStatus } from './status.js';

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

	if (subcommand === WalletSubcommands.LIST) {
		return <WalletList />;
	}

	if (subcommand === WalletSubcommands.LOCK) {
		return <WalletLock />;
	}

	if (subcommand === WalletSubcommands.STATUS) {
		return <WalletStatus />;
	}

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
