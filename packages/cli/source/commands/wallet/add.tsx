import { Box, Text } from 'ink';
import { SelectList } from '../../components/select-list.js';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useWalletAdd } from '../../lib/hooks/wallet-hooks.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';
import { useSetAtom } from 'jotai';

type AddWalletFormValues = {
	name: string;
	privateKey: string;
};

enum AddStep {
	EnterName = 'enter-name',
	EnterPrivateKey = 'enter-private-key',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}

export function WalletAdd() {
	const [step, setStep] = useState<AddStep>(AddStep.EnterName);

	const { watch, setValue, getValues } = useForm<AddWalletFormValues>({
		defaultValues: {
			name: '',
			privateKey: '',
		},
	});

	const name = watch('name');
	const privateKey = watch('privateKey');

	const { mutate: addWallet, error } = useWalletAdd();
	const modal = useModal();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const handleSubmit = () => {
		const values = getValues();
		setStep(AddStep.Submitting);

		addWallet(
			{ name: values.name, privateKey: values.privateKey },
			{
				onSuccess: () => {
					setStep(AddStep.Complete);
					setTimeout(() => {
						pushCommandLog({
							input: `${COMMANDS.wallet.label} ${WalletSubcommands.ADD}`,
							output: <Text color="green">Wallet &quot;{values.name}&quot; Added</Text>,
						});
						modal.dismiss();
					}, SETUP_COMPLETE_TIMEOUT_MS);
				},
				onError: () => {
					setStep(AddStep.Error);
				},
			},
		);
	};

	if (step === AddStep.EnterName) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter a name for your wallet:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Name: </Text>
					<TextInput
						value={name}
						onChange={(value) => setValue('name', value)}
						onSubmit={() => {
							if (name.trim() !== '') {
								setStep(AddStep.EnterPrivateKey);
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === AddStep.EnterPrivateKey) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter the private key for &quot;{name}&quot;:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Your private key will be encrypted with your master key.</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>Private Key: </Text>
					<TextInput
						value={privateKey}
						onChange={(value) => setValue('privateKey', value)}
						onSubmit={() => {
							if (privateKey.trim() !== '') {
								handleSubmit();
							}
						}}
						mask="*"
					/>
				</Box>
			</Box>
		);
	}

	if (step === AddStep.Submitting) {
		return (
			<SetupComplete
				message="Adding wallet..."
				showSpinner
				spinnerText="Encrypting and storing your wallet..."
			/>
		);
	}

	if (step === AddStep.Complete) {
		return <SetupComplete message={`✓ Wallet "${name}" added successfully!`} />;
	}

	if (step === AddStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to add wallet
				</Text>
				<Box marginTop={1}>
					<Text color="red">{error?.message || 'Could not connect to the server'}</Text>
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
