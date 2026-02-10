import { Text } from 'ink';
import BigText from 'ink-big-text';
import React from 'react';

export function Header() {
	return (
		<>
			<Text color="#FCCB3D" bold>
				<BigText text="TradeShell" />
			</Text>
			<Text color="gray">Type commands below. Type '/' for suggestions. Type 'exit' to quit.</Text>
			<Text> </Text>
		</>
	);
}
