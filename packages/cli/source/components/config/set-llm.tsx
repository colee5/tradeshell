import React from 'react';
import { LlmOnboarding } from '../onboard/llm-onboarding.js';
import { useModal } from '../../lib/hooks/use-modal.js';

export function SetLlm() {
	const modal = useModal();

	return <LlmOnboarding onComplete={() => modal.dismiss()} />;
}
