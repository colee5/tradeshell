import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useWalletAddFromMnemonic } from '../../lib/hooks/wallet-hooks.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';
import { SetupComplete } from '../onboard/setup-complete.js';
import { SelectList } from '../select-list.js';

enum Step {
	EnterName = 'enter-name',
	EnterMnemonic = 'enter-mnemonic',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}

export function AddFromMnemonic() {
	const [step, setStep] = useState<Step>(Step.EnterName);
	const [name, setName] = useState('');
	const [nameError, setNameError] = useState('');
	const [mnemonic, setMnemonic] = useState('');
	const [mnemonicError, setMnemonicError] = useState('');

	const { mutate: addWallet, error } = useWalletAddFromMnemonic();
	const modal = useModal();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const handleNameSubmit = () => {
		if (name.trim().toLowerCase() === 'exit') {
			modal.dismiss();
			return;
		}

		if (!name.trim()) {
			setNameError('Name is required');
			return;
		}

		setNameError('');
		setStep(Step.EnterMnemonic);
	};

	const handleMnemonicSubmit = () => {
		if (mnemonic.trim().toLowerCase() === 'exit') {
			modal.dismiss();
			return;
		}

		const words = mnemonic.trim().split(/\s+/);
		if (words.length !== 12 && words.length !== 24) {
			setMnemonicError('Seed phrase must be 12 or 24 words');
			return;
		}

		setMnemonicError('');
		setStep(Step.Submitting);

		addWallet(
			{ name: name.trim(), mnemonic: mnemonic.trim() },
			{
				onSuccess: () => {
					setStep(Step.Complete);
					setTimeout(() => {
						pushCommandLog({
							input: `${COMMANDS.wallet.label} ${WalletSubcommands.ADD}`,
							output: <Text color="green">Wallet &quot;{name}&quot; added</Text>,
						});
						modal.dismiss();
					}, SETUP_COMPLETE_TIMEOUT_MS);
				},
				onError: () => setStep(Step.Error),
			},
		);
	};

	if (step === Step.EnterName) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter a name for your wallet:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Name: </Text>
					<TextInput value={name} onChange={setName} onSubmit={handleNameSubmit} />
				</Box>
				<Box marginTop={1}>
					<Text dimColor>Type &quot;exit&quot; and press Enter to cancel.</Text>
				</Box>
				{nameError && (
					<Box marginTop={1}>
						<Text color="red">{nameError}</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === Step.EnterMnemonic) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter your seed phrase for &quot;{name}&quot;:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Enter all 12 or 24 words separated by spaces.</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>Phrase: </Text>
					<TextInput value={mnemonic} onChange={setMnemonic} onSubmit={handleMnemonicSubmit} />
				</Box>
				<Box marginTop={1}>
					<Text dimColor>Type &quot;exit&quot; and press Enter to cancel.</Text>
				</Box>
				{mnemonicError && (
					<Box marginTop={1}>
						<Text color="red">{mnemonicError}</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === Step.Submitting) {
		return (
			<SetupComplete
				message="Adding wallet..."
				showSpinner
				spinnerText="Deriving keys from seed phrase..."
			/>
		);
	}

	if (step === Step.Complete) {
		return <SetupComplete message={`✓ Wallet "${name}" added successfully!`} />;
	}

	if (step === Step.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to add wallet
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
