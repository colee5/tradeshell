export const COMMANDS = {
	login: { name: 'login', label: '/login [username]' },
	balance: { name: 'balance', label: '/balance' },
	help: { name: 'help', label: '/help' },
	r: { name: 'r', label: '/r (reload)' },
	exit: { name: 'exit', label: '/exit' },
} as const;

export const AVAILABLE_COMMANDS = Object.values(COMMANDS);
