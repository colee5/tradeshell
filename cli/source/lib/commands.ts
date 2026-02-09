export enum ConfigSubcommands {
	RESET = 'reset',
	GET = 'get',
}

export enum WalletSubcommands {
	SETUP = 'setup',
	UNLOCK = 'unlock',
	LOCK = 'lock',
	STATUS = 'status',
	ADD = 'add',
	LIST = 'list',
	DELETE = 'delete',
	SWITCH = 'switch',
	PASSWORD = 'password',
}

export const COMMANDS = {
	login: { name: 'login', label: '/login [username]' },
	balance: { name: 'balance', label: '/balance' },
	config: {
		name: 'config',
		label: 'config',
	},
	wallet: {
		name: 'wallet',
		label: '/wallet',
		subcommands: [
			{ name: WalletSubcommands.SETUP, label: 'setup' },
			{ name: WalletSubcommands.UNLOCK, label: 'unlock' },
			{ name: WalletSubcommands.LOCK, label: 'lock' },
			{ name: WalletSubcommands.STATUS, label: 'status' },
			{ name: WalletSubcommands.ADD, label: 'add' },
			{ name: WalletSubcommands.LIST, label: 'list' },
			{ name: WalletSubcommands.DELETE, label: 'delete' },
			{ name: WalletSubcommands.SWITCH, label: 'switch' },
			{ name: WalletSubcommands.PASSWORD, label: 'password' },
		],
	},
	onboard: { name: 'onboard', label: '/onboard' },
	help: { name: 'help', label: '/help' },
	r: { name: 'r', label: '/r (reload)' },
	reset: { name: 'reset', label: '/reset' },
	exit: { name: 'exit', label: '/exit' },
} as const;

export const AVAILABLE_COMMANDS = Object.values(COMMANDS);
