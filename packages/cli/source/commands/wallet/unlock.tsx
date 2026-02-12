import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { walletPasswordSchema } from '@tradeshell/core';
import { SetupComplete } from '../../components/onboard/setup-complete.js';
import { SelectList } from '../../components/select-list.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletStatus, useWalletUnlock } from '../../lib/hooks/wallet-hooks.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';
import { useSetAtom } from 'jotai';

type UnlockFormValues = z.infer<typeof walletPasswordSchema>;

enum UnlockStep {
	CheckingStatus = 'checking-status',
	AlreadyUnlocked = 'already-unlocked',
	EnterPassword = 'enter-password',
	Submitting = 'submitting',
	Complete = 'complete',
	Error = 'error',
}

export function WalletUnlock() {
	const [step, setStep] = useState<UnlockStep>(UnlockStep.CheckingStatus);
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const {
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useForm<UnlockFormValues>({
		resolver: zodResolver(walletPasswordSchema),
		mode: 'onChange',
		defaultValues: {
			password: '',
		},
	});

	const password = watch('password');

	const { data: walletStatus, isLoading } = useGetWalletStatus();
	const { mutate: unlock, error } = useWalletUnlock();
	const modal = useModal();

	useEffect(() => {
		if (step === UnlockStep.CheckingStatus && !isLoading) {
			if (walletStatus?.isUnlocked) {
				setStep(UnlockStep.AlreadyUnlocked);
			} else {
				setStep(UnlockStep.EnterPassword);
			}
		}
	}, [step, isLoading, walletStatus]);

	const handleSubmit = () => {
		setStep(UnlockStep.Submitting);
		unlock(
			{ password },
			{
				onSuccess: () => {
					pushCommandLog({
						input: `${COMMANDS.wallet.label} ${WalletSubcommands.UNLOCK}`,
						output: <Text color="green">Wallet Unlocked</Text>,
					});
					modal.dismiss();
				},
				onError: () => {
					setStep(UnlockStep.Error);
				},
			},
		);
	};

	if (isLoading || step === UnlockStep.CheckingStatus) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Checking wallet status...</Text>
			</Box>
		);
	}

	if (step === UnlockStep.AlreadyUnlocked) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="yellow">
					Wallets are already unlocked.
				</Text>
				<Box marginTop={1}>
					<SelectList
						items={[{ label: 'OK', value: 'ok' }]}
						onSelect={() => {
							modal.dismiss();
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === UnlockStep.EnterPassword) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text bold color="cyan">
					Enter your master password:
				</Text>
				<Box marginTop={1} flexDirection="row">
					<Text>Password: </Text>
					<TextInput
						value={password}
						onChange={(value) => setValue('password', value)}
						onSubmit={async () => {
							const valid = await trigger('password');
							if (valid) {
								handleSubmit();
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

	if (step === UnlockStep.Submitting) {
		return (
			<SetupComplete message="Unlocking..." showSpinner spinnerText="Decrypting your wallets..." />
		);
	}

	if (step === UnlockStep.Error) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="red">
				<Text bold color="red">
					✖ Failed to unlock
				</Text>
				<Box marginTop={1}>
					<Text color="red">{error?.message || 'Invalid password'}</Text>
				</Box>
				<Box marginTop={1}>
					<SelectList
						items={[
							{ label: 'Try again', value: 'retry' },
							{ label: 'Exit', value: 'exit' },
						]}
						onSelect={(item) => {
							if (item.value === 'retry') {
								setValue('password', '');
								setStep(UnlockStep.EnterPassword);
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
