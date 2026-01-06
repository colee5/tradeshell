import {CLI_COMMANDS} from '../lib/commands.js';

export function help(): string {
	return `Available commands: ${Object.values(CLI_COMMANDS).join(', ')}`;
}
