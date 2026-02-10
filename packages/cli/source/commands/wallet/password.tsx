import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SETUP_COMPLETE_TIMEOUT_MS } from '../../lib/constants/index.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import {
	useGetWalletStatus,
	useWalletChangePassword,
	useWalletCheckPassword,
} from '../../lib/hooks/wallet-hooks.js';

type PasswordFormValues = {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
};

enum PasswordStep {
	CheckingStatus = 'checking-status',
	NotSetup = 'not-setup',
	EnterOldPassword = 'enter-old-password',
	VerifyingPassword = 'verifying-password',
	InvalidPassword = 'invalid-password',
	EnterNewPassword = 'enter-new-password',
	ConfirmNewPassword = 'confirm-new-password',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}

export function WalletPassword() {
	const [step, setStep] = useState<PasswordStep>(PasswordStep.CheckingStatus);

	const { watch, setValue } = useForm<PasswordFormValues>({
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const oldPassword = watch('oldPassword');
	const newPassword = watch('newPassword');
	const confirmPassword = watch('confirmPassword');

	const { data: walletStatus, isLoading } = useGetWalletStatus();
	const { mutate: checkPassword } = useWalletCheckPassword();
	const { mutate: changePassword, error } = useWalletChangePassword();
	const modal = useModal();

	useEffect(() => {
		if (step === PasswordStep.CheckingStatus && !isLoading) {
			if (!walletStatus?.isSetup) {
				setStep(PasswordStep.NotSetup);
			} else {
				setStep(PasswordStep.EnterOldPassword);
			}
		}
	}, [step, isLoading, walletStatus]);

	const verifyOldPassword = () => {
		setStep(PasswordStep.VerifyingPassword);
		checkPassword(
			{ password: oldPassword },
			{
				onSuccess: () => {
					setStep(PasswordStep.EnterNewPassword);
				},
				onError: () => {
					setStep(PasswordStep.InvalidPassword);
				},
			},
		);
	};

	const handleSubmit = () => {
		setStep(PasswordStep.Submitting);
		changePassword(
			{ oldPassword, newPassword },
			{
				onSuccess: () => {
					setStep(PasswordStep.Complete);
					setTimeout(() => {
						modal.dismiss();
					}, SETUP_COMPLETE_TIMEOUT_MS);
				},
				onError: () => {
					setStep(PasswordStep.Error);
				},
			},
		);
	};

	if (isLoading || step === PasswordStep.CheckingStatus) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Checking wallet status...</Text>
			</Box>
		);
	}

	if (step === PasswordStep.NotSetup) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="yellow">
					Wallet is not set up yet.
				</Text>
				<Box marginTop={1}>
					<Text dimColor>
						Run{' '}
						<Text bold color="cyan">
							/wallet setup
						</Text>{' '}
						first.
					</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={[{ label: 'OK', value: 'ok' }]}
						onSelect={() => {
							modal.dismiss();
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === PasswordStep.EnterOldPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter your current password:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Current password: </Text>
					<TextInput
						value={oldPassword}
						onChange={(value) => setValue('oldPassword', value)}
						onSubmit={() => {
							if (oldPassword.trim() !== '') {
								verifyOldPassword();
							}
						}}
						mask="*"
					/>
				</Box>
			</Box>
		);
	}

	if (step === PasswordStep.VerifyingPassword) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Verifying password...</Text>
			</Box>
		);
	}

	if (step === PasswordStep.InvalidPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="red">
					Incorrect password.
				</Text>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{ label: 'Try again', value: 'retry' },
							{ label: 'Exit', value: 'exit' },
						]}
						onSelect={(item) => {
							if (item.value === 'retry') {
								setValue('oldPassword', '');
								setStep(PasswordStep.EnterOldPassword);
							} else {
								modal.dismiss();
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === PasswordStep.EnterNewPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter your new password:
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Must be at least 4 characters.</Text>
				</Box>
				<Box marginTop={1} flexDirection="row">
					<Text>New password: </Text>
					<TextInput
						value={newPassword}
						onChange={(value) => setValue('newPassword', value)}
						onSubmit={() => {
							if (newPassword.trim().length >= 4) {
								setStep(PasswordStep.ConfirmNewPassword);
							}
						}}
						mask="*"
					/>
				</Box>
				{newPassword.trim() !== '' && newPassword.trim().length < 4 && (
					<Box marginTop={1}>
						<Text color="red">Password must be at least 4 characters</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (step === PasswordStep.ConfirmNewPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Confirm your new password:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Confirm: </Text>
					<TextInput
						value={confirmPassword}
						onChange={(value) => setValue('confirmPassword', value)}
						onSubmit={() => {
							if (confirmPassword !== newPassword) {
								setValue('confirmPassword', '');
								return;
							}

							handleSubmit();
						}}
						mask="*"
					/>
				</Box>
				{confirmPassword !== '' &&
					confirmPassword !== newPassword.slice(0, confirmPassword.length) && (
						<Box marginTop={1}>
							<Text color="red">Passwords do not match</Text>
						</Box>
					)}
			</Box>
		);
	}

	if (step === PasswordStep.Submitting) {
		return (
			<SetupComplete
				message="Changing password..."
				showSpinner
				spinnerText="Updating your master password..."
			/>
		);
	}

	if (step === PasswordStep.Complete) {
		return <SetupComplete message="✓ Password changed!" />;
	}

	if (step === PasswordStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to change password
				</Text>
				<Box marginTop={1}>
					<Text color="red">{error?.message || 'Invalid current password'}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{ label: 'Try again', value: 'retry' },
							{ label: 'Exit', value: 'exit' },
						]}
						onSelect={(item) => {
							if (item.value === 'retry') {
								setValue('oldPassword', '');
								setValue('newPassword', '');
								setValue('confirmPassword', '');
								setStep(PasswordStep.EnterOldPassword);
							} else {
								modal.dismiss();
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	return null;
}
