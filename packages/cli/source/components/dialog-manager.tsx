import { Box } from 'ink';
import { useAtomValue } from 'jotai';
import React from 'react';
import { activeModalAtom, hasActivemodalAtom } from '../lib/store/modal.atom.js';
import { Header } from './header.js';

type Props = {
	children: React.ReactNode;
};

export function DialogManager({ children }: Props) {
	const hasDialog = useAtomValue(hasActivemodalAtom);
	const activeDialog = useAtomValue(activeModalAtom);

	if (hasDialog && activeDialog) {
		const showHeader = activeDialog.config?.showHeader ?? true;

		return (
			<Box flexDirection="column">
				{showHeader && <Header />}
				{activeDialog.component}
			</Box>
		);
	}

	return <>{children}</>;
}
