export const CONFIG_EVENTS = {
	LLM_UPDATED: 'config.llm.updated',
	BLOCKCHAIN_UPDATED: 'config.blockchain.updated',
} as const;

export const WALLET_EVENTS = {
	UNLOCKED: 'wallet.unlocked',
	SWITCHED: 'wallet.switched',
	LOCKED: 'wallet.locked',
} as const;
