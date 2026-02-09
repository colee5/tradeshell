import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React, { useEffect, useRef, useState } from 'react';
import { useGetWalletStatus, useWalletLock } from '../../lib/hooks/api-hooks.js';

enum LockStep {
	Locking = 'locking',
	Complete = 'complete',
	Error = 'error',
}

export function WalletLock() {
	const [step, setStep] = useState<LockStep>(LockStep.Locking);
	const [walletCount, setWalletCount] = useState(0);
	const hasStartedLock = useRef(false);

	const { data: walletStatus } = useGetWalletStatus();
	const { mutate: lock, error } = useWalletLock();

	useEffect(() => {
		if (step === LockStep.Locking && !hasStartedLock.current) {
			hasStartedLock.current = true;
			lock(
				{},
				{
					onSuccess: () => {
						setWalletCount(walletStatus?.walletCount || 0);
						setStep(LockStep.Complete);
					},
					onError: () => {
						setStep(LockStep.Error);
					},
				},
			);
		}
	}, [step, lock, walletStatus]);

	if (step === LockStep.Locking) {
		return (
			<Box flexDirection="row" gap={1}>
				<Spinner />
				<Text>Locking wallets...</Text>
			</Box>
		);
	}

	if (step === LockStep.Complete) {
		return (
			<Box flexDirection="column">
				<Text color="green">
					✓ {walletCount} wallet{walletCount === 1 ? '' : 's'} locked
				</Text>
				<Box marginTop={1}>
					<Text dimColor>
						Use{' '}
						<Text bold color="cyan">
							/wallet unlock
						</Text>{' '}
						to unlock them again.
					</Text>
				</Box>
			</Box>
		);
	}

	if (step === LockStep.Error) {
		return (
			<Text color="red">
				Failed to lock wallets: {error?.message || 'Could not connect to the server'}
			</Text>
		);
	}

	return null;
}
