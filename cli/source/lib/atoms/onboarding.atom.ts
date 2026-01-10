import { atom } from 'jotai';
import type { OnboardingFormData } from '../schemas/onboarding.schema.js';

export const onboardingCompletedAtom = atom(false);
export const savedConfigAtom = atom<OnboardingFormData | null>(null);
