import { Box, Text, useApp } from 'ink';
import SyntaxHighlight from 'ink-syntax-highlight';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';

import { Balance, Chat, Config, Help, Login, Reload } from './commands/index.js';
import { CommandSuggestions } from './components/command-suggestions.js';
import { Header } from './components/header.js';

import { COMMANDS } from './lib/commands.js';
import { useGetConfig } from './lib/hooks/api-hooks.js';
import { isCommand } from './lib/utils.js';

type HistoryItem = {
	input: string;
	output: React.ReactElement;
};

export default function Index() {
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [input, setInput] = useState('');

	const { exit } = useApp();
	// TODO: Instead of an atom for this savedConfig - have it query it from the server.
	// This is because if the user has the config saved - he's not gonna have the atom updated!
	const { data: savedConfig, isLoading: isSavedConfigLoading } = useGetConfig();

	const showSuggestions = input === '/';

	const processCommand = (command: string): React.ReactElement | null => {
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
				return <Config />;
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

		const output = processCommand(command);

		if (output) {
			setHistory([...history, { input: command, output }]);
		}

		setInput('');
	};

	return (
		<Box flexDirection="column">
			<Header />
			{savedConfig && !isSavedConfigLoading && (
				<Box
					flexDirection="column"
					paddingX={2}
					paddingY={1}
					borderStyle="round"
					borderColor="#FCCB3D"
				>
					<Text bold color="green">
						Your config is
					</Text>
					<Box marginTop={1}>
						<SyntaxHighlight
							code={JSON.stringify({ ...savedConfig, apiKey: '*************' }, null, 2)}
							language="json"
						/>
					</Box>
				</Box>
			)}
			<Box flexDirection="column">
				{history.map((item, index) => (
					<Box key={index} flexDirection="column">
						<Text>
							<Text color="green">&gt; </Text>
							{item.input}
						</Text>
						{item.output}
					</Box>
				))}
			</Box>
			<Box flexDirection="column">
				<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
				<Box paddingX={1}>
					<Text color="green">&gt; </Text>
					<TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
				</Box>
				<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
			</Box>
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
