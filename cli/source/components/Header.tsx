import { Text } from 'ink';
import React from 'react';

// TODO: Redesign
export function Header() {
	return (
		<>
			<Text color="cyan" bold>
				=== TradeShell Interactive Mode ===
			</Text>
			<Text color="gray">Type commands below. Type '/' for suggestions. Type 'exit' to quit.</Text>
			<Text> </Text>
		</>
	);
}
