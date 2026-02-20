import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { useProcessMessage } from '../lib/hooks/agent-hooks.js';
import { chatIdAtom } from '../lib/store/chat.atom.js';
import { replaceCommandLogEntryAtom } from '../lib/store/command-log.atom.js';

type Props = {
	message: string;
	entryId: string;
};

export function Chat({ message, entryId }: Props) {
	const chatId = useAtomValue(chatIdAtom);
	const processMessage = useProcessMessage();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);
	const hasSent = useRef(false);

	useEffect(() => {
		if (hasSent.current) return;
		hasSent.current = true;

		processMessage.mutate(
			{ input: message, chatId },
			{
				onSuccess: (data) => {
					replaceEntry({
						id: entryId,
						output: <Text>{data.text}</Text>,
					});
				},
				onError: (error) => {
					replaceEntry({
						id: entryId,
						output: (
							<Text color="red">{error instanceof Error ? error.message : 'Unknown error'}</Text>
						),
					});
				},
			},
		);
	}, []);

	return (
		<Box flexDirection="row" gap={1}>
			<Spinner />
			<Text>Thinking...</Text>
		</Box>
	);
}
