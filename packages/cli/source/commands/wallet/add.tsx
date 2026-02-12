import { zodResolver } from '@hookform/resolvers/zod';
import { addWalletInputSchema } from '@tradeshell/core';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SelectList } from '../../components/select-list.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletStatus, useWalletAdd } from '../../lib/hooks/wallet-hooks.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';

type AddWalletFormValues = z.input<typeof addWalletInputSchema>;

enum AddStep {
	EnterName = 'enter-name',
	EnterPrivateKey = 'enter-private-key',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}
// TODO: Add a prop which tells if this component is rendered after the setup, and therefor
// We need to have a header like, "Now add your wallet" instead of just "Add a name for your wallet"
export function WalletAdd() {
	const [step, setStep] = useState<AddStep>(AddStep.EnterName);

	const {
		watch,
		setValue,
		getValues,
		trigger,
		formState: { errors },
	} = useForm<AddWalletFormValues>({
		resolver: zodResolver(addWalletInputSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			privateKey: '',
		},
	});

	const name = watch('name');
	const privateKey = watch('privateKey');
	const { data: walletStatus } = useGetWalletStatus();
	const { mutate: addWallet, error } = useWalletAdd();
	const modal = useModal();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const isWalletUnlocked = walletStatus?.isUnlocked;

	useEffect(() => {
		if (!isWalletUnlocked) {
			pushCommandLog({
				input: `${COMMANDS.wallet.label} ${WalletSubcommands.ADD}`,
				output: (
					<Text color="red">
						Cannot add a wallet while your wallet is locked. Please run{' '}
						<Text bold color="white">
							/wallet unlock
						</Text>{' '}
						to unlock them.
					</Text>
				),
			});
			modal.dismiss();
		}
	}, [isWalletUnlocked]);

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

	if (!isWalletUnlocked) {
		return null;
	}

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
						onSubmit={async () => {
							const valid = await trigger('name');
							if (valid) {
								setStep(AddStep.EnterPrivateKey);
							}
						}}
					/>
				</Box>
				{errors.name && (
					<Box marginTop={1}>
						<Text color="red">{errors.name.message}</Text>
					</Box>
				)}
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
						onSubmit={async () => {
							const valid = await trigger('privateKey');

							if (valid) {
								handleSubmit();
							}
						}}
						mask="*"
					/>
				</Box>
				{errors.privateKey && (
					<Box marginTop={1}>
						<Text color="red">{errors.privateKey.message}</Text>
					</Box>
				)}
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
