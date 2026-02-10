import { Box, Text } from 'ink';
import { SelectList } from '../../components/select-list.js';
import Spinner from 'ink-spinner';
import React, { useState } from 'react';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useGetWalletList, useWalletDelete } from '../../lib/hooks/wallet-hooks.js';
import { useModal } from '../../lib/hooks/use-modal.js';

enum DeleteStep {
	Select = 'select',
	Confirm = 'confirm',
	Deleting = 'deleting',
	Complete = 'complete',
	Error = 'error',
}

export function WalletDelete() {
	const [step, setStep] = useState<DeleteStep>(DeleteStep.Select);
	const [selectedAddress, setSelectedAddress] = useState('');
	const [selectedName, setSelectedName] = useState('');

	const { data: walletList, error: listError, isLoading } = useGetWalletList();
	const { mutate: deleteWallet, error: deleteError } = useWalletDelete();
	const modal = useModal();

	if (isLoading) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Loading wallets...</Text>
			</Box>
		);
	}

	if (listError) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text color="red">
					Failed to fetch wallets:{' '}
					{listError instanceof Error ? listError.message : 'Unknown error'}
				</Text>
				<Box marginTop={1}>
					<SelectList
						items={[{ label: 'Exit', value: 'exit' }]}
						onSelect={() => {
							modal.dismiss();
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (!walletList?.wallets.length) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text dimColor>No wallets found. Use /wallet add to add one.</Text>
				<Box marginTop={1}>
					<SelectList
						items={[{ label: 'Exit', value: 'exit' }]}
						onSelect={() => {
							modal.dismiss();
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === DeleteStep.Select) {
		const items = walletList.wallets.map((wallet) => ({
			label: `${wallet.name} ${wallet.address}${wallet.isActive ? ' (active)' : ''}`,
			value: wallet.address,
		}));

		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Select a wallet to delete:
				</Text>
				<Box marginTop={1}>
					<SelectList
						items={items}
						onSelect={(item) => {
							const wallet = walletList.wallets.find((w) => w.address === item.value);
							setSelectedAddress(item.value);
							setSelectedName(wallet?.name || '');
							setStep(DeleteStep.Confirm);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === DeleteStep.Confirm) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="red">
					Are you sure you want to delete &quot;{selectedName}&quot;?
				</Text>
				<Box marginTop={1}>
					<Text dimColor>{selectedAddress}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectList
						items={[
							{ label: 'Yes, delete this wallet', value: 'yes' },
							{ label: 'No, cancel', value: 'no' },
						]}
						onSelect={(item) => {
							if (item.value === 'no') {
								modal.dismiss();
								return;
							}

							setStep(DeleteStep.Deleting);
							deleteWallet(
								{ address: selectedAddress },
								{
									onSuccess: () => {
										setStep(DeleteStep.Complete);
										setTimeout(() => {
											modal.dismiss();
										}, SETUP_COMPLETE_TIMEOUT_MS);
									},
									onError: () => {
										setStep(DeleteStep.Error);
									},
								},
							);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === DeleteStep.Deleting) {
		return (
			<SetupComplete
				message={`Deleting "${selectedName}"...`}
				showSpinner
				spinnerText="Removing wallet..."
			/>
		);
	}

	if (step === DeleteStep.Complete) {
		return <SetupComplete message={`✓ Wallet "${selectedName}" deleted`} />;
	}

	if (step === DeleteStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to delete wallet
				</Text>
				<Box marginTop={1}>
					<Text color="red">{deleteError?.message || 'Could not connect to the server'}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectList
						items={[{ label: 'Exit', value: 'exit' }]}
						onSelect={() => {
							modal.dismiss();
						}}
					/>
				</Box>
			</Box>
		);
	}

	return null;
}
