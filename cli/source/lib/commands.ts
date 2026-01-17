export enum ConfigSubcommands {
	RESET = 'reset',
	GET = 'get',
}

export const COMMANDS = {
	login: { name: 'login', label: '/login [username]' },
	balance: { name: 'balance', label: '/balance' },
	config: {
		name: 'config',
		label: '/config',
		subcommands: [
			{ name: ConfigSubcommands.RESET, label: 'reset' },
			{ name: ConfigSubcommands.GET, label: 'get' },
		],
	},
	onboard: { name: 'onboard', label: '/onboard' },
	help: { name: 'help', label: '/help' },
	r: { name: 'r', label: '/r (reload)' },
	exit: { name: 'exit', label: '/exit' },
} as const;

export const AVAILABLE_COMMANDS = Object.values(COMMANDS);
