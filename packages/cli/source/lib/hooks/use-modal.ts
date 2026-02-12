import { useSetAtom } from 'jotai';
import { ReactElement } from 'react';
import {
	clearModalsAtom,
	ModalComponent,
	popModalAtom,
	pushModalAtom,
} from '../store/modal.atom.js';

export function useModal() {
	const push = useSetAtom(pushModalAtom);
	const pop = useSetAtom(popModalAtom);
	const clear = useSetAtom(clearModalsAtom);

	const show = (component: ReactElement, config?: ModalComponent['config']) => {
		push({
			id: `modal-${Date.now()}`,
			component,
			config,
		});
	};

	const dismiss = () => {
		pop();
	};

	const reset = () => {
		clear();
	};

	return {
		show,
		dismiss,
		reset,
	};
}
