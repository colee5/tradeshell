import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletStatus, useWalletSetup } from '../../lib/hooks/wallet-hooks.js';
import { WalletAdd } from './add.js';

type SetupFormValues = {
	password: string;
	confirmPassword: string;
};

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
	const [step, setStep] = useState<SetupStep>(SetupStep.CheckingStatus);
	const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

	const { watch, setValue } = useForm<SetupFormValues>({
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const password = watch('password');
	const confirmPassword = watch('confirmPassword');

	const { data: walletStatus, isLoading } = useGetWalletStatus();
	const { mutate: setup, error } = useWalletSetup();
	const modal = useModal();

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
						modal.dismiss();
						modal.show(<WalletAdd />);
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
						onSubmit={() => {
							if (password.trim() !== '') {
								setStep(SetupStep.ConfirmPassword);
							}
						}}
						mask="*"
					/>
				</Box>
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
						onSubmit={() => {
							if (confirmPassword !== password) {
								setValue('confirmPassword', '');
								return;
							}

							handleSubmit();
						}}
						mask="*"
					/>
				</Box>
				{confirmPassword !== '' &&
					confirmPassword !== password.slice(0, confirmPassword.length) && (
						<Box marginTop={1}>
							<Text color="red">Passwords do not match</Text>
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
