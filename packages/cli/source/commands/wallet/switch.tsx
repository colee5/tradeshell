import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SelectList } from '../../components/select-list.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletList, useWalletSetActive } from '../../lib/hooks/wallet-hooks.js';
import { resetChatIdAtom } from '../../lib/store/chat.atom.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';

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
	const pushCommandLog = useSetAtom(pushCommandLogAtom);
	const resetChatId = useSetAtom(resetChatIdAtom);

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

	if (!walletList?.length) {
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

	if (step === SwitchStep.Select) {
		const items = walletList.map((wallet) => ({
			label: `${wallet.name} ${wallet.address}${wallet.isActive ? ' (active)' : ''}`,
			value: wallet.address,
		}));

		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Select a wallet to switch to:
				</Text>
				<Box marginTop={1}>
					<SelectList
						items={items}
						onSelect={(item) => {
							const wallet = walletList.find((w) => w.address === item.value);
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
										resetChatId();
										setStep(SwitchStep.Complete);

										pushCommandLog({
											input: `${COMMANDS.wallet.label} ${WalletSubcommands.SWITCH}`,
											output: <Text color="green">Switched to &quot;{wallet?.name}&quot;</Text>,
										});
										modal.dismiss();
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
