import { Box } from 'ink';
import { useAtomValue } from 'jotai';
import React, { ReactNode } from 'react';
import { activeModalAtom, hasActivemodalAtom } from '../lib/store/modal.atom.js';
import { Header } from './header.js';

type Props = {
	children: ReactNode;
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
