import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import React, { useState } from 'react';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletList, useWalletSetActive } from '../../lib/hooks/wallet-hooks.js';

enum SwitchStep {
	Select = 'select',
	Switching = 'switching',
	Complete = 'complete',
	Error = 'error',
}

export function WalletSwitch() {
	const [step, setStep] = useState<SwitchStep>(SwitchStep.Select);
	const [selectedName, setSelectedName] = useState('');

	const { data: walletList, error: listError, isLoading } = useGetWalletList();
	const { mutate: setActive, error: switchError } = useWalletSetActive();
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
					<SelectInput
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
					<SelectInput
						items={[{ label: 'Exit', value: 'exit' }]}
						onSelect={() => {
							modal.dismiss();
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === SwitchStep.Select) {
		const items = walletList.wallets.map((wallet) => ({
			label: `${wallet.name} ${wallet.address}${wallet.isActive ? ' (active)' : ''}`,
			value: wallet.address,
		}));

		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Select a wallet to switch to:
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={items}
						onSelect={(item) => {
							const wallet = walletList.wallets.find((w) => w.address === item.value);
							if (wallet?.isActive) {
								modal.dismiss();
								return;
							}

							setSelectedName(wallet?.name || '');
							setStep(SwitchStep.Switching);
							setActive(
								{ address: item.value },
								{
									onSuccess: () => {
										setStep(SwitchStep.Complete);
										setTimeout(() => {
											modal.dismiss();
										}, SETUP_COMPLETE_TIMEOUT_MS);
									},
									onError: () => {
										setStep(SwitchStep.Error);
									},
								},
							);
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === SwitchStep.Switching) {
		return (
			<SetupComplete
				message={`Switching to "${selectedName}"...`}
				showSpinner
				spinnerText="Updating active wallet..."
			/>
		);
	}

	if (step === SwitchStep.Complete) {
		return <SetupComplete message={`✓ Switched to "${selectedName}"`} />;
	}

	if (step === SwitchStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to switch wallet
				</Text>
				<Box marginTop={1}>
					<Text color="red">{switchError?.message || 'Could not connect to the server'}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
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
