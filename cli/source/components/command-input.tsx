import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';
import { useGetWalletStatus } from '../lib/hooks/api-hooks';
import { truncateAddress } from '../lib/utils';

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
};

export function CommandInput({ value, onChange, onSubmit }: Props) {
	const { data: walletStatus, isLoading } = useGetWalletStatus();

	return (
		<Box flexDirection="column">
			<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
			<Box paddingX={1}>
				{isLoading ? (
					<Text color="gray">... </Text>
				) : walletStatus?.activeName && walletStatus.activeAddress ? (
					<Text color="red">
						{walletStatus.activeName}({truncateAddress(walletStatus.activeAddress, 3)}) ❯{' '}
					</Text>
				) : (
					<Text color="green">❯ </Text>
				)}
				<TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
			</Box>
			<Text color="#404040">{'─'.repeat(process.stdout.columns || 80)}</Text>
		</Box>
	);
}
