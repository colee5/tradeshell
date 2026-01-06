import { Text } from 'ink';
import React from 'react';

type Props = {
	history: string[];
};

export function CommandHistory({ history }: Props) {
	return (
		<>
			{history.map((line, i) => (
				<Text key={i} color={line.startsWith('>') ? 'yellow' : 'white'}>
					{line}
				</Text>
			))}
		</>
	);
}
