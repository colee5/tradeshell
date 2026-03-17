import { Box, Text } from 'ink';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { SelectList } from '../../components/select-list.js';
import { COMMANDS, WalletSubcommands } from '../../lib/commands.js';
import { useModal } from '../../lib/hooks/use-modal.js';
import { useGetWalletStatus } from '../../lib/hooks/wallet-hooks.js';
import { pushCommandLogAtom } from '../../lib/store/command-log.atom.js';
import { AddFromMnemonic } from '../../components/wallet/add-mnemonic.js';
import { AddFromPrivateKey } from '../../components/wallet/add-private-key.js';

enum Method {
	PrivateKey = 'private-key',
	Mnemonic = 'mnemonic',
}

export function WalletAdd() {
	const [method, setMethod] = useState<Method | null>(null);
	const { data: walletStatus } = useGetWalletStatus();
	const modal = useModal();
	const pushCommandLog = useSetAtom(pushCommandLogAtom);

	const isWalletUnlocked = walletStatus?.isUnlocked;

	useEffect(() => {
		if (!isWalletUnlocked) {
			pushCommandLog({
				input: `${COMMANDS.wallet.label} ${WalletSubcommands.ADD}`,
				output: (
					<Text color="red">
						Cannot add a wallet while locked. Please run{' '}
						<Text bold color="white">
							/wallet unlock
						</Text>{' '}
						first.
					</Text>
				),
			});
			modal.dismiss();
		}
	}, [isWalletUnlocked]);

	if (!isWalletUnlocked) return null;

	if (method === Method.PrivateKey) return <AddFromPrivateKey />;
	if (method === Method.Mnemonic) return <AddFromMnemonic />;

	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Text bold color="cyan">
				How would you like to import your wallet?
			</Text>
			<Box marginTop={1}>
				<SelectList
					items={[
						{ label: 'Private key', value: Method.PrivateKey },
						{ label: 'Seed phrase (mnemonic)', value: Method.Mnemonic },
					]}
					onSelect={(item) => setMethod(item.value as Method)}
				/>
			</Box>
		</Box>
	);
}
