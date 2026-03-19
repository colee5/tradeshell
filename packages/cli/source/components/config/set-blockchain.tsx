import React from 'react';
import { BlockchainOnboarding } from '../onboard/blockchain-onboarding.js';
import { useModal } from '../../lib/hooks/use-modal.js';

export function SetBlockchain() {
	const modal = useModal();

	return <BlockchainOnboarding onComplete={() => modal.dismiss()} />;
}
