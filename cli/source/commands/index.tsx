import {Box, Text, useApp, useInput} from 'ink';
import React, {useState} from 'react';
import {CLI_COMMANDS} from '../lib/commands.js';

export default function Index() {
	const [history, setHistory] = useState<string[]>([]);
	const [input, setInput] = useState('');
	const {exit} = useApp();

	useInput((inputChar, key) => {
		// If key === /, render and map autocomplete options
		if (key.return) {
			const command = input.trim();

			if (command === CLI_COMMANDS.exit) {
				exit();
				return;
			}

			const output = processCommand(command);
			setHistory([...history, `> ${command}`, output]);
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

function processCommand(command: string): string {
	const parts = command.split(' ');
	const cmd = parts[0];
	const args = parts.slice(1);

	switch (cmd) {
		case CLI_COMMANDS.login:
			return args.length > 0 ? `✓ LOGGED IN as ${args[0]}` : '✓ LOGGED IN';

		case CLI_COMMANDS.balance:
			return '💰 Your balance: $0,000.000';

		case CLI_COMMANDS.help:
			return `Available commands: ${Object.values(CLI_COMMANDS).join(', ')}`;

		case CLI_COMMANDS.r:
			process.exit(42);
			return '🔄 Restarting CLI...';

		case '':
			return '';

		// Default should be an API request to the AI streaming endpoint. This way
		// We can still run commands in the chat interface. Also - we need autocomplete :)
		default:
			return `Unknown command: ${cmd}. Type 'help' for available commands.`;
	}
}
