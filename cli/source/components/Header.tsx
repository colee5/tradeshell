import { Text } from 'ink';
import figlet from 'figlet';
import React from 'react';

const LOGO = figlet.textSync('> TradeShell', {
	font: 'Standard',
	horizontalLayout: 'default',
});

export function Header() {
	return (
		<>
			<Text color="#FCCB3D" bold>
				{LOGO}
			</Text>
			<Text color="gray">Type commands below. Type '/' for suggestions. Type 'exit' to quit.</Text>
			<Text> </Text>
		</>
	);
}
