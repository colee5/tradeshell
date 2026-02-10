import { Text } from 'ink';
import React from 'react';

export function Chat({ message }: { message: string }) {
	return <Text>🤖 AI: &quot;{message}&quot; (coming soon...)</Text>;
}
