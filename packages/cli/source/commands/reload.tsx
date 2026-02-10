import { useEffect } from 'react';
import { RELOAD_ERROR_CODE } from '../lib/constants/index.js';

export function Reload() {
	useEffect(() => {
		process.exit(RELOAD_ERROR_CODE);
	}, []);

	return null;
}
