import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SelectList } from '../../components/select-list.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletStatus, useWalletDeploy } from '../../lib/hooks/wallet-hooks.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';

enum DeployStep {
	EnterName = 'enter-name',
	Generating = 'generating',
	ShowMnemonic = 'show-mnemonic',
	Complete = 'complete',
	Error = 'error',
}

export function WalletDeploy() {
	const [step, setStep] = useState<DeployStep>(DeployStep.EnterName);
	const [name, setName] = useState('');
	const [nameError, setNameError] = useState('');
	const [mnemonic, setMnemonic] = useState('');
	const [address, setAddress] = useState('');

	const { data: walletStatus } = useGetWalletStatus();
	const { mutate: deployWallet, error } = useWalletDeploy();
	const modal = useModal();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const isWalletUnlocked = walletStatus?.isUnlocked;

	useEffect(() => {
		if (!isWalletUnlocked) {
			pushCommandLog({
				input: `${COMMANDS.wallet.label} ${WalletSubcommands.DEPLOY}`,
				output: (
					<Text color="red">
						Cannot deploy a wallet while locked. Please run{' '}
						<Text bold color="white">
							/wallet unlock
						</Text>{' '}
						first.
					</Text>
				),
			});
			modal.dismiss();
		}
	}, [isWalletUnlocked]);

	const handleNameSubmit = () => {
		if (!name.trim()) {
			setNameError('Name is required');
			return;
		}

		setNameError('');
		setStep(DeployStep.Generating);

		deployWallet(
			{ name: name.trim(), setActive: true },
			{
				onSuccess: (result) => {
					setMnemonic(result.mnemonic);
					setAddress(result.address);
					setStep(DeployStep.ShowMnemonic);
				},
				onError: () => {
					setStep(DeployStep.Error);
				},
			},
		);
	};

	const handleMnemonicConfirm = () => {
		setStep(DeployStep.Complete);
		setTimeout(() => {
			pushCommandLog({
				input: `${COMMANDS.wallet.label} ${WalletSubcommands.DEPLOY}`,
				output: (
					<Box flexDirection="column">
						<Text color="green">Wallet &quot;{name}&quot; deployed and set as active</Text>
						<Text dimColor>{address}</Text>
					</Box>
				),
			});
			modal.dismiss();
		}, SETUP_COMPLETE_TIMEOUT_MS);
	};

	if (!isWalletUnlocked) return null;

	if (step === DeployStep.EnterName) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter a name for your new wallet:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Name: </Text>
					<TextInput value={name} onChange={setName} onSubmit={handleNameSubmit} />
				</Box>
				{nameError && (
					<Box marginTop={1}>
						<Text color="red">{nameError}</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === DeployStep.Generating) {
		return (
			<SetupComplete
				message="Generating wallet..."
				showSpinner
				spinnerText="Deriving keys from seed phrase..."
			/>
		);
	}

	if (step === DeployStep.ShowMnemonic) {
		const words = mnemonic.split(' ');
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="yellow">
					⚠ Write down your seed phrase — it will never be shown again.
				</Text>
				<Box
					marginTop={1}
					flexDirection="column"
					borderStyle="round"
					borderColor="yellow"
					paddingX={2}
					paddingY={1}
				>
					<Box flexDirection="row" flexWrap="wrap" gap={1}>
						{words.map((word, i) => (
							<Box key={i} width={18}>
								<Text dimColor>{String(i + 1).padStart(2, ' ')}. </Text>
								<Text bold>{word}</Text>
							</Box>
						))}
					</Box>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>Address: {address}</Text>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>Press </Text>
					<Text>Enter</Text>
					<Text dimColor> to continue</Text>
					<TextInput value="" onChange={() => {}} onSubmit={handleMnemonicConfirm} />
				</Box>
			</Box>
		);
	}

	if (step === DeployStep.Complete) {
		return <SetupComplete message={`✓ Wallet "${name}" deployed successfully!`} />;
	}

	if (step === DeployStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to deploy wallet
				</Text>
				<Box marginTop={1}>
					<Text color="red">{error?.message ?? 'Could not connect to the server'}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectList items={[{ label: 'Exit', value: 'exit' }]} onSelect={() => modal.dismiss()} />
				</Box>
			</Box>
		);
	}

	return null;
}
