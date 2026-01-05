import {Box, Text} from 'ink';
import React, {useEffect, useState} from 'react';
import {codeToANSI} from '@shikijs/cli';

export default function ShikiDemo() {
	const [highlightedCode, setHighlightedCode] = useState<string>('');

	const codeExample = `function greet(name: string): string {
  console.log('Hello, ' + name);
  return \`Welcome to TradeShell, \${name}!\`;
}

const user = 'Trader';
const message = greet(user);`;

	useEffect(() => {
		async function highlight() {
			const ansiCode = await codeToANSI(
				codeExample,
				'typescript',
				'github-dark',
			);

			setHighlightedCode(ansiCode);
		}

		highlight();
	}, []);

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan" bold>
				=== Shiki Syntax Highlighting Demo (Terminal) ===
			</Text>
			<Text> </Text>

			<Text color="yellow">TypeScript Example with ANSI colors:</Text>
			<Text> </Text>

			{/* Render ANSI-colored code */}
			{highlightedCode ? (
				<Text>{highlightedCode}</Text>
			) : (
				<Text color="gray">Loading...</Text>
			)}

			<Text> </Text>
			<Text color="green">
				✓ This uses Shiki's codeToANSI for proper terminal syntax highlighting!
			</Text>
		</Box>
	);
}
