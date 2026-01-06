import { RELOAD_ERROR_CODE } from '../lib/constants.js';

export function reload(): string {
	process.exit(RELOAD_ERROR_CODE);
	return 'Restarting CLI...';
}
