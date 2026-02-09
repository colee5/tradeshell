import { Box, useApp } from 'ink';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';

import { Balance, Chat, Config, Help, Login, Onboard, Reload } from './commands/index.js';
import { CommandInput } from './components/command-input.js';
import { CommandSuggestions } from './components/command-suggestions.js';
import { Header } from './components/header.js';

import { InitialConfigPrompt } from './components/initial-config-prompt.js';

import { WalletAdd } from './commands/wallet/add.js';
import { WalletDelete } from './commands/wallet/delete.js';
import { Wallet } from './commands/wallet/index.js';
import { WalletPassword } from './commands/wallet/password.js';
import { WalletSetup } from './commands/wallet/setup.js';
import { WalletSwitch } from './commands/wallet/switch.js';
import { WalletUnlock } from './commands/wallet/unlock.js';
import { CommandHistory } from './components/command-history.js';
import { InitialWalletPrompt } from './components/initial-wallet-prompt.js';
import { COMMANDS, WalletSubcommands } from './lib/commands.js';
import { useModal } from './lib/hooks/use-modal.js';
import { commandLogAtom, pushCommandLogAtom } from './lib/store/command-log.atom.js';
import { isCommand } from './lib/utils.js';

export default function Index() {
	const [input, setInput] = useState('');
	const modal = useModal();
	const { exit } = useApp();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);
	const resetCommandLog = useSetAtom(commandLogAtom);

	const showSuggestions = input === '/';

	const processCommand = (command: string) => {
		const parts = command.split(' ');
		let cmd = parts[0];
		const args = parts.slice(1);

		if (cmd === '') return null;

		if (isCommand(cmd)) {
			cmd = cmd?.slice(1);
		}

		switch (cmd) {
			case COMMANDS.login.name:
				return <Login args={args} />;
			case COMMANDS.balance.name:
				return <Balance />;
			case COMMANDS.config.name:
				return <Config args={args} />;
			case COMMANDS.wallet.name:
				return <Wallet args={args} />;
			case COMMANDS.help.name:
				return <Help />;
			case COMMANDS.r.name:
				return <Reload />;
			default:
				return <Chat message={[cmd, ...args].join(' ')} />;
		}
	};

	const handleSubmit = (command: string) => {
		if (command === COMMANDS.exit.name || command === '/exit') {
			exit();
			process.exit(0);
		}

		if (command === COMMANDS.reset.name || command === '/reset') {
			resetCommandLog([]);
			setInput('');
			return;
		}

		const parts = command.split(' ');
		let cmd = parts[0];
		const subCommand = parts[1];

		if (isCommand(cmd)) {
			cmd = cmd?.slice(1);
		}

		// Cases in which we handle special modal commands
		if (cmd === COMMANDS.onboard.name) {
			modal.show(<Onboard />, {
				showHeader: false,
			});
			setInput('');
			return;
		}

		if (cmd === COMMANDS.wallet.name && subCommand === WalletSubcommands.SETUP) {
			modal.show(<WalletSetup />);
			setInput('');
			return;
		}

		if (cmd === COMMANDS.wallet.name && subCommand === WalletSubcommands.ADD) {
			modal.show(<WalletAdd />);
			setInput('');
			return;
		}

		if (cmd === COMMANDS.wallet.name && subCommand === WalletSubcommands.SWITCH) {
			modal.show(<WalletSwitch />);
			setInput('');
			return;
		}

		if (cmd === COMMANDS.wallet.name && subCommand === WalletSubcommands.DELETE) {
			modal.show(<WalletDelete />);
			setInput('');
			return;
		}

		if (cmd === COMMANDS.wallet.name && subCommand === WalletSubcommands.UNLOCK) {
			modal.show(<WalletUnlock />);
			setInput('');
			return;
		}

		if (cmd === COMMANDS.wallet.name && subCommand === WalletSubcommands.PASSWORD) {
			modal.show(<WalletPassword />);
			setInput('');
			return;
		}

		const output = processCommand(command);

		if (output) {
			pushCommandLog({ input: command, output });
		}

		setInput('');
	};

	return (
		<Box flexDirection="column">
			<Header />
			<InitialConfigPrompt />
			<InitialWalletPrompt />
			<CommandHistory />
			<CommandInput value={input} onChange={setInput} onSubmit={handleSubmit} />
			<CommandSuggestions
				show={showSuggestions}
				onSelect={(command) => {
					setInput(command);
					handleSubmit(command);
				}}
			/>
		</Box>
	);
}
