import { Box, Text, useApp } from 'ink';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';

import { balance, chat, help, login, reload } from './commands/index.js';
import { CommandHistory } from './components/command-history.js';
import { CommandSuggestions } from './components/command-suggestions.js';
import { Header } from './components/header.js';
import { COMMANDS } from './lib/commands.js';
import { isCommand } from './lib/utils.js';

export default function Index() {
	const [history, setHistory] = useState<string[]>([]);
	const [input, setInput] = useState('');
	const { exit } = useApp();

	const showSuggestions = input === '/';

	const processCommand = async (command: string) => {
		const parts = command.split(' ');
		let cmd = parts[0];
		const args = parts.slice(1);

		if (cmd === '') return '';

		if (isCommand(cmd)) {
			cmd = cmd?.slice(1);
		}

		switch (cmd) {
			case COMMANDS.login.name:
				return login(args);
			case COMMANDS.balance.name:
				return balance();
			case COMMANDS.help.name:
				return help();
			case COMMANDS.r.name:
				return reload();
			default:
				return chat([cmd, ...args].join(' '));
		}
	};

	const handleSubmit = (command: string) => {
		if (command === COMMANDS.exit.name || command === '/exit') {
			exit();
			process.exit(0);
		}

		void processCommand(command).then((output: string) => {
			setHistory([...history, `> ${command}`, output]);
			setInput('');
		});
	};

	return (
		<Box flexDirection="column">
			<Header />
			<CommandHistory history={history} />
			<Box flexDirection="column">
				<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
				<Box paddingX={1}>
					<Text color="green">&gt; </Text>
					<TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
				</Box>
				<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
			</Box>
			<CommandSuggestions show={showSuggestions} />
		</Box>
	);
}
