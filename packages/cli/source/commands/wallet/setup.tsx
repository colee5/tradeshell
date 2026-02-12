import { Box, Text } from 'ink';
import { SelectList } from '../../components/select-list.js';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { walletSetupSchema } from '@tradeshell/core';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletStatus, useWalletSetup } from '../../lib/hooks/wallet-hooks.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';
import { useSetAtom } from 'jotai';
import { WalletAdd } from './add.js';

type SetupFormValues = z.infer<typeof walletSetupSchema>;

enum SetupStep {
	CheckingStatus = 'checking-status',
	AlreadySetup = 'already-setup',
	EnterPassword = 'enter-password',
	ConfirmPassword = 'confirm-password',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}

export function WalletSetup() {
	const modal = useModal();
	const [step, setStep] = useState<SetupStep>(SetupStep.CheckingStatus);
	const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

	const {
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useForm<SetupFormValues>({
		resolver: zodResolver(walletSetupSchema),
		mode: 'onChange',
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const password = watch('password');
	const confirmPassword = watch('confirmPassword');

	const { data: walletStatus, isLoading } = useGetWalletStatus();
	const { mutate: setup, error } = useWalletSetup();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	if (!hasCheckedStatus && !isLoading) {
		setHasCheckedStatus(true);
		if (walletStatus?.isSetup) {
			setStep(SetupStep.AlreadySetup);
		} else {
			setStep(SetupStep.EnterPassword);
		}
	}

	const handleSubmit = () => {
		setStep(SetupStep.Submitting);
		setup(
			{ password },
			{
				onSuccess: () => {
					setStep(SetupStep.Complete);
					setTimeout(() => {
						pushCommandLog({
							input: `${COMMANDS.wallet.label} ${WalletSubcommands.SETUP}`,
							output: <Text color="green">Wallet Setup Complete</Text>,
						});
						modal.dismiss();
						modal.show(<WalletAdd />, { showHeader: false });
					}, SETUP_COMPLETE_TIMEOUT_MS);
				},
				onError: () => {
					setStep(SetupStep.Error);
				},
			},
		);
	};

	if (isLoading || step === SetupStep.CheckingStatus) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Checking wallet status...</Text>
			</Box>
		);
	}

	if (step === SetupStep.AlreadySetup) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="yellow">
					Wallet is already set up.
				</Text>

				{!walletStatus?.isUnlocked && (
					<Box marginTop={1}>
						<Text dimColor>
							Use{' '}
							<Text bold color="cyan">
								/wallet unlock
							</Text>{' '}
							to unlock your wallet.
						</Text>
					</Box>
				)}

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

	if (step === SetupStep.EnterPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Create a master password for your wallet:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>This password encrypts your wallet. Make sure to remember it.</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>Password: </Text>
					<TextInput
						value={password}
						onChange={(value) => setValue('password', value)}
						onSubmit={async () => {
							const valid = await trigger('password');
							if (valid) {
								setStep(SetupStep.ConfirmPassword);
							}
						}}
						mask="*"
					/>
				</Box>
				{errors.password && (
					<Box marginTop={1}>
						<Text color="red">{errors.password.message}</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === SetupStep.ConfirmPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Confirm your master password:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Confirm: </Text>
					<TextInput
						value={confirmPassword}
						onChange={(value) => setValue('confirmPassword', value)}
						onSubmit={async () => {
							const valid = await trigger();
							if (valid) {
								handleSubmit();
							}
						}}
						mask="*"
					/>
				</Box>
				{errors.confirmPassword && (
					<Box marginTop={1}>
						<Text color="red">{errors.confirmPassword.message}</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === SetupStep.Submitting) {
		return (
			<SetupComplete
				message="Setting up wallet..."
				showSpinner
				spinnerText="Creating your encrypted wallet..."
			/>
		);
	}

	if (step === SetupStep.Complete) {
		return <SetupComplete message="✓ Wallet setup complete!" />;
	}

	if (step === SetupStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to set up wallet
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
