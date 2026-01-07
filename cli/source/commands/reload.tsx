import { useApp } from 'ink';
import { useEffect } from 'react';
import { RELOAD_ERROR_CODE } from '../lib/constants.js';

export function Reload() {
	const { exit } = useApp();

	useEffect(() => {
		exit();
		process.exit(RELOAD_ERROR_CODE);
	}, [exit]);
}
