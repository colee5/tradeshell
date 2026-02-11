import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';
import { useGetWalletStatus } from '../lib/hooks/wallet-hooks';
import { truncateAddress } from '../lib/utils';
import figureSet from 'figures';
import { BORDER_COLOR } from '../lib/constants/colors';

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
};

export function CommandInput({ value, onChange, onSubmit }: Props) {
	const { data: walletStatus, isLoading } = useGetWalletStatus();

	return (
		<Box flexDirection="column">
			<Text color={BORDER_COLOR}>{'─'.repeat(process.stdout.columns || 80)}</Text>
			<Box paddingX={1}>
				{isLoading ? (
					<Text color="gray">... </Text>
				) : walletStatus?.activeName && walletStatus.activeAddress ? (
					<Text color="red">
						{walletStatus.activeName}({truncateAddress(walletStatus.activeAddress, 3)}){' '}
						{figureSet.pointer}{' '}
					</Text>
				) : (
					<Text color="green">{figureSet.pointer} </Text>
				)}
				<TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
			</Box>
			<Text color={BORDER_COLOR}>{'─'.repeat(process.stdout.columns || 80)}</Text>
		</Box>
	);
}
