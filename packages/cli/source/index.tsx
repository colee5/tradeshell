import { Box, useApp } from 'ink';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';

import { Chat, Config, Help, Onboard, Reload } from './commands/index.js';
import { WalletAdd } from './commands/wallet/add.js';
import { WalletDelete } from './commands/wallet/delete.js';
import { Wallet } from './commands/wallet/index.js';
import { WalletPassword } from './commands/wallet/password.js';
import { WalletSetup } from './commands/wallet/setup.js';
import { WalletSwitch } from './commands/wallet/switch.js';
import { WalletUnlock } from './commands/wallet/unlock.js';
import { CommandHistory } from './components/command-history.js';
import { CommandInput } from './components/command-input.js';
import { CommandSuggestions } from './components/command-suggestions.js';
import { Header } from './components/header.js';
import { InitialOnboardingPrompt } from './components/initial-onboarding-prompt.js';
import { COMMANDS, WalletSubcommands } from './lib/commands.js';
import { useModal } from './lib/hooks/use-modal.js';
import { commandLogAtom, pushCommandLogAtom } from './lib/store/command-log.atom.js';
import { isCommand, nextEntryId } from './lib/utils.js';

export default function Index() {
	const [input, setInput] = useState('');
	const modal = useModal();
	const { exit } = useApp();

	const pushCommandLog = useSetAtom(pushCommandLogAtom);
	const resetCommandLog = useSetAtom(commandLogAtom);

	const showSuggestions = input.startsWith('/');

	const processCommand = (command: string) => {
		const parts = command.split(' ');

		let cmd = parts[0];
		const args = parts.slice(1);

		if (cmd === '') return null;

		if (isCommand(cmd)) {
			cmd = cmd?.slice(1);
		}

		const id = nextEntryId();

		switch (cmd) {
			case COMMANDS.config.name:
				return { id, output: <Config args={args} input={command} entryId={id} /> };
			case COMMANDS.wallet.name:
				return { id, output: <Wallet args={args} input={command} entryId={id} /> };
			case COMMANDS.help.name:
				return { id, output: <Help /> };
			case COMMANDS.r.name:
				return { id, output: <Reload /> };
			default:
				return { id, output: <Chat message={[cmd, ...args].join(' ')} entryId={id} /> };
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

		const result = processCommand(command);

		if (result) {
			pushCommandLog({ id: result.id, input: command, output: result.output });
		}

		setInput('');
	};

	return (
		<Box flexDirection="column">
			<Header />
			<CommandHistory />
			<CommandInput
				value={input}
				onChange={setInput}
				onSubmit={showSuggestions ? () => {} : handleSubmit}
			/>
			{!showSuggestions && <InitialOnboardingPrompt />}
			{showSuggestions && (
				<CommandSuggestions
					input={input}
					onSelect={(command) => {
						setInput(command);
						handleSubmit(command);
					}}
				/>
			)}
		</Box>
	);
}
