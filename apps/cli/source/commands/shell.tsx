import React, {useState} from 'react';
import {Box, Text, useInput, useApp} from 'ink';

export default function Shell() {
	const [history, setHistory] = useState<string[]>([]);
	const [input, setInput] = useState('');
	const {exit} = useApp();

	useInput((inputChar, key) => {
		if (key.return) {
			// User pressed Enter
			const command = input.trim();

			if (command === 'exit' || command === 'quit') {
				exit();
				return;
			}

			// Process the command
			const output = processCommand(command);
			setHistory([...history, `> ${command}`, output]);
			setInput('');
		} else if (key.backspace || key.delete) {
			// Handle backspace
			setInput(input.slice(0, -1));
		} else if (!key.ctrl && !key.meta) {
			// Add character to input
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
		case 'login':
			return args.length > 0
				? `✓ LOGGED IN as ${args[0]}`
				: '✓ LOGGED IN';

		case 'help':
			return 'Available commands: login, help, clear, exit';

		case 'clear':
			// This won't work perfectly, but you could reset history
			return '';

		case '':
			return '';

		default:
			return `❌ Unknown command: ${cmd}. Type 'help' for available commands.`;
	}
}
