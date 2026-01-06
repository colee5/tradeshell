import { AVAILABLE_COMMANDS } from '../lib/commands.js';

export function help(): string {
	return `Available commands:\n${AVAILABLE_COMMANDS.map((cmd) => `  ${cmd.label}`).join('\n')}`;
}
