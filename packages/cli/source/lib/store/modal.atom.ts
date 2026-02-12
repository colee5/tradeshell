import { atom } from 'jotai';
import { ReactElement } from 'react';

export type ModalComponent = {
	id: string;
	component: ReactElement;
	config?: {
		showHeader?: boolean;
	};
};

export const modalStackAtom = atom<ModalComponent[]>([]);

// Currently active modal (top of stack)
export const activeModalAtom = atom((get) => {
	const stack = get(modalStackAtom);

	return stack.length > 0 ? stack[stack.length - 1] : null;
});

export const hasActivemodalAtom = atom((get) => get(modalStackAtom).length > 0);

// Push modal onto stack
export const pushModalAtom = atom(null, (get, set, modal: ModalComponent) => {
	const current = get(modalStackAtom);

	set(modalStackAtom, [...current, modal]);
});

// Pop top modal from stack
export const popModalAtom = atom(null, (get, set) => {
	const current = get(modalStackAtom);

	if (current.length > 0) {
		set(modalStackAtom, current.slice(0, -1));
	}
});

// Clear all modals
export const clearModalsAtom = atom(null, (_, set) => {
	set(modalStackAtom, []);
});
