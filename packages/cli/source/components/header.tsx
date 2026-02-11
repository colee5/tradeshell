import { Text } from 'ink';
import BigText from 'ink-big-text';
import React from 'react';
import { PRIMARY_COLOR } from '../lib/constants/colors';

export function Header() {
	return (
		<>
			<Text color={PRIMARY_COLOR} bold>
				<BigText text="TradeShell" />
			</Text>
			<Text color="gray">Type commands below. Type '/' for suggestions. Type 'exit' to quit.</Text>
			<Text> </Text>
		</>
	);
}
