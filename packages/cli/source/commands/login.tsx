import { Text } from 'ink';
import React from 'react';

export function Login({ args }: { args: string[] }) {
	if (args.length > 0) {
		return <Text>✓ LOGGED IN as {args[0]}</Text>;
	}
	return <Text>✓ LOGGED IN</Text>;
}
