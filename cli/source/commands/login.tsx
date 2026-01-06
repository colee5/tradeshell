export function login(args: string[]): string {
	if (args.length > 0) {
		return `✓ LOGGED IN as ${args[0]}`;
	}
	return '✓ LOGGED IN';
}
