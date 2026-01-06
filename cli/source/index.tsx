import { Box, Text, useApp } from 'ink';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';

import { balance, chat, help, login, reload } from './commands/index.js';
import { CommandHistory } from './components/CommandHistory.js';
import { CommandSuggestions } from './components/CommandSuggestions.js';
import { Header } from './components/Header.js';
import { COMMANDS } from './lib/commands.js';

export default function Index() {
	const [history, setHistory] = useState<string[]>([]);
	const [input, setInput] = useState('');
	const { exit } = useApp();

	const showSuggestions = input === '/';

	const handleSubmit = (command: string) => {
		if (command === COMMANDS.exit.name || command === '/exit') {
			exit();
			return;
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
			<Box>
				<Text color="green">&gt; </Text>
				<TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
			</Box>
			<CommandSuggestions show={showSuggestions} />
		</Box>
	);
}

async function processCommand(command: string): Promise<string> {
	const parts = command.split(' ');
	let cmd = parts[0];
	const args = parts.slice(1);

	if (cmd === '') return '';

	if (cmd?.startsWith('/')) {
		cmd = cmd.slice(1);
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
}
