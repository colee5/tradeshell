import { Box, Text, useApp, useInput } from 'ink';
import React, { useState } from 'react';

import { balance, chat, help, login, reload } from './commands/index.js';

import Spinner from 'ink-spinner';
import { CLI_COMMANDS } from './lib/commands.js';

export default function Index() {
	const [history, setHistory] = useState<string[]>([]);
	const [input, setInput] = useState('');
	const { exit } = useApp();

	useInput((inputChar, key) => {
		if (key.return) {
			const command = input.trim();

			if (command === CLI_COMMANDS.exit) {
				exit();
				return;
			}

			void processCommand(command).then((output: string) => {
				setHistory([...history, `> ${command}`, output]);
			});

			setInput('');
		} else if (key.backspace || key.delete) {
			setInput(input.slice(0, -1));
		} else if (!key.ctrl && !key.meta) {
			setInput(input + inputChar);
		}
	});

	return (
		<Box flexDirection="column">
			<Text color="cyan" bold>
				=== TradeShell Interactive Mode ===
			</Text>
			<Text color="gray">Type commands below. Type 'exit' to quit.</Text>
			<Text> </Text>

			<Spinner />
			{/* Command history */}
			{history.map((line, i) => (
				<Text key={i} color={line.startsWith('>') ? 'yellow' : 'white'}>
					{line}
				</Text>
			))}

			{/* Current input line */}
			<Text>
				<Text color="green">&gt; </Text>
				<Text>{input}</Text>
				<Text color="cyan">▊</Text>
			</Text>
		</Box>
	);
}

async function processCommand(command: string): Promise<string> {
	const parts = command.split(' ');
	const cmd = parts[0];
	const args = parts.slice(1);

	if (cmd === '') return '';

	switch (cmd) {
		case CLI_COMMANDS.login:
			return login(args);
		case CLI_COMMANDS.balance:
			return balance();
		case CLI_COMMANDS.help:
			return help();
		case CLI_COMMANDS.r:
			return reload();
		default:
			return chat([cmd, ...args].join(' '));
	}
}
