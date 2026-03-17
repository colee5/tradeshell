import { zodResolver } from '@hookform/resolvers/zod';
import { addWalletInputSchema } from '@tradeshell/core';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { SetupComplete } from '../onboard/setup-complete.js';
import { SelectList } from '../select-list.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useWalletAddFromPrivateKey } from '../../lib/hooks/wallet-hooks.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';

type FormValues = z.input<typeof addWalletInputSchema>;

enum Step {
	EnterName = 'enter-name',
	EnterPrivateKey = 'enter-private-key',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}

export function AddFromPrivateKey() {
	const [step, setStep] = useState<Step>(Step.EnterName);

	const {
		watch,
		setValue,
		getValues,
		trigger,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(addWalletInputSchema),
		mode: 'onChange',
		defaultValues: { name: '', privateKey: '' },
	});

	const name = watch('name');
	const privateKey = watch('privateKey');
	const { mutate: addWallet, error } = useWalletAddFromPrivateKey();
	const modal = useModal();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const handleSubmit = () => {
		const values = getValues();
		setStep(Step.Submitting);

		addWallet(
			{ name: values.name, privateKey: values.privateKey },
			{
				onSuccess: () => {
					setStep(Step.Complete);
					setTimeout(() => {
						pushCommandLog({
							input: `${COMMANDS.wallet.label} ${WalletSubcommands.ADD}`,
							output: <Text color="green">Wallet &quot;{values.name}&quot; added</Text>,
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
					<TextInput
						value={name}
						onChange={(value) => setValue('name', value)}
						onSubmit={async () => {
							if (name.trim().toLowerCase() === 'exit') {
								modal.dismiss();
								return;
							}

							const valid = await trigger('name');
							if (valid) setStep(Step.EnterPrivateKey);
						}}
					/>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>Type &quot;exit&quot; and press Enter to cancel.</Text>
				</Box>
				{errors.name && (
					<Box marginTop={1}>
						<Text color="red">{errors.name.message}</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === Step.EnterPrivateKey) {
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
						onSubmit={async () => {
							if (privateKey.trim().toLowerCase() === 'exit') {
								modal.dismiss();
								return;
							}

							const valid = await trigger('privateKey');
							if (valid) handleSubmit();
						}}
						mask="*"
					/>
				</Box>
				<Box marginTop={1}>
				<Text dimColor>Type &quot;exit&quot; and press Enter to cancel.</Text>
			</Box>
			{errors.privateKey && (
					<Box marginTop={1}>
						<Text color="red">{errors.privateKey.message}</Text>
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
				spinnerText="Encrypting and storing your wallet..."
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
