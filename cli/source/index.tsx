import { Box, useApp } from 'ink';
import React, { useState } from 'react';

import { Balance, Chat, Config, Help, Login, Onboard, Reload } from './commands/index.js';
import { CommandInput } from './components/command-input.js';
import { CommandSuggestions } from './components/command-suggestions.js';
import { Header } from './components/header.js';

import { InitialConfigPrompt } from './components/initial-config-prompt.js';

import { CommandHistory, HistoryItem } from './components/command-history.js';
import { COMMANDS } from './lib/commands.js';
import { isCommand } from './lib/utils.js';

export default function Index() {
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [input, setInput] = useState('');
	const [isOnboardingActive, setIsOnboardingActive] = useState(false);
	const { exit } = useApp();

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
				return <Config args={args} />;
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

		const parts = command.split(' ');
		let cmd = parts[0];

		if (isCommand(cmd)) {
			cmd = cmd?.slice(1);
		}

		// cole: Special pattern for when we want to render something
		// which does not render the other elements like the chat input etc
		if (cmd === COMMANDS.onboard.name) {
			setIsOnboardingActive(true);
			setInput('');
			return;
		}

		const output = processCommand(command);

		if (output) {
			setHistory([...history, { input: command, output }]);
		}

		setInput('');
	};

	if (isOnboardingActive) {
		return (
			<Box flexDirection="column">
				<Header />
				<Onboard onComplete={() => setIsOnboardingActive(false)} />
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Header />
			<InitialConfigPrompt />

			<CommandHistory history={history} />

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
