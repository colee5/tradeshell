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
	config: {
		name: 'config',
		label: '/config',
		description: 'Manage configuration',
		subcommands: [
			{ name: ConfigSubcommands.GET, label: 'get', description: 'Show current config' },
			{ name: ConfigSubcommands.RESET, label: 'reset', description: 'Reset config to defaults' },
		],
	},
	wallet: {
		name: 'wallet',
		label: '/wallet',
		description: 'Manage wallets',
		subcommands: [
			{
				name: WalletSubcommands.SETUP,
				label: 'setup',
				description: 'Create master key & first wallet',
			},
			{ name: WalletSubcommands.UNLOCK, label: 'unlock', description: 'Unlock with password' },
			{ name: WalletSubcommands.LOCK, label: 'lock', description: 'Lock the wallet' },
			{ name: WalletSubcommands.STATUS, label: 'status', description: 'Show wallet status' },
			{ name: WalletSubcommands.ADD, label: 'add', description: 'Add a new wallet' },
			{ name: WalletSubcommands.LIST, label: 'list', description: 'List all wallets' },
			{ name: WalletSubcommands.DELETE, label: 'delete', description: 'Remove a wallet' },
			{ name: WalletSubcommands.SWITCH, label: 'switch', description: 'Switch active wallet' },
			{
				name: WalletSubcommands.PASSWORD,
				label: 'password',
				description: 'Change master password',
			},
		],
	},
	onboard: { name: 'onboard', label: '/onboard', description: 'Interactive setup wizard' },
	help: { name: 'help', label: '/help', description: 'Show available commands' },
	r: { name: 'r', label: '/r (reload)', description: 'Reload services' },
	reset: { name: 'reset', label: '/reset', description: 'Clear command history' },
	exit: { name: 'exit', label: '/exit', description: 'Quit the application' },
} as const;

export const AVAILABLE_COMMANDS = Object.values(COMMANDS);
