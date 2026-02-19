import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { useGetWalletStatus, useWalletLock } from '../../lib/hooks/wallet-hooks.js';
import { replaceCommandLogEntryAtom } from '../../lib/store/command-log.atom.js';

type Props = {
	input: string;
	entryId: string;
};

enum LockStep {
	Locking = 'locking',
	Complete = 'complete',
	Error = 'error',
}

export function WalletLock({ entryId }: Props) {
	const [step, setStep] = useState<LockStep>(LockStep.Locking);
	const [walletCount, setWalletCount] = useState(0);
	const hasStartedLock = useRef(false);
	const hasReplaced = useRef(false);

	const { data: walletStatus } = useGetWalletStatus();
	const { mutate: lock, error } = useWalletLock();
	const replaceEntry = useSetAtom(replaceCommandLogEntryAtom);

	useEffect(() => {
		if (step === LockStep.Locking && !hasStartedLock.current) {
			hasStartedLock.current = true;
			lock(undefined, {
				onSuccess: () => {
					setWalletCount(walletStatus?.walletCount || 0);
					setStep(LockStep.Complete);
				},
				onError: () => {
					setStep(LockStep.Error);
				},
			});
		}
	}, [step, lock, walletStatus]);

	useEffect(() => {
		if (hasReplaced.current) return;

		if (step === LockStep.Complete) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
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
				),
			});
		}

		if (step === LockStep.Error) {
			hasReplaced.current = true;
			replaceEntry({
				id: entryId,
				output: (
					<Text color="red">
						Failed to lock wallets: {error?.message || 'Could not connect to the server'}
					</Text>
				),
			});
		}
	}, [step, walletCount, error]);

	return (
		<Box flexDirection="row" gap={1}>
			<Spinner />
			<Text>Locking wallets...</Text>
		</Box>
	);
}
