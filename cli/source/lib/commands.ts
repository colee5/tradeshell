export const COMMANDS = {
	login: { name: 'login', label: '/login [username]' },
	balance: { name: 'balance', label: '/balance' },
	config: { name: 'config', label: '/config' },
	help: { name: 'help', label: '/help' },
	// Should be here ONLY on dev
	r: { name: 'r', label: '/r (reload)' },
	exit: { name: 'exit', label: '/exit' },
} as const;

export const AVAILABLE_COMMANDS = Object.values(COMMANDS);
