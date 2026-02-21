import type {
	BlockchainConfig,
	Chat,
	Config,
	LlmConfig,
	SerializableChain,
	WalletInfo,
	WalletStatus,
} from '@tradeshell/core';

export type RpcMethods = {
	// Config
	getConfig: { args: void; return: Config };
	updateLlmConfig: { args: LlmConfig; return: Config };
	updateBlockchainConfig: { args: BlockchainConfig; return: Config };
	resetConfig: { args: void; return: Config };
	getChains: { args: void; return: { chains: SerializableChain[] } };

	// Wallet
	walletSetup: { args: { password: string }; return: void };
	walletUnlock: { args: { password: string }; return: void };
	walletLock: { args: void; return: void };
	walletCheckPassword: { args: { password: string }; return: void };
	walletChangePassword: { args: { oldPassword: string; newPassword: string }; return: void };
	walletAdd: { args: { privateKey: string; name: string; setActive?: boolean }; return: void };
	walletList: { args: void; return: WalletInfo[] };
	walletGetStatus: { args: void; return: WalletStatus };
	walletSetActive: { args: { address: string }; return: void };
	walletDelete: { args: { address: string }; return: void };

	// Agent
	agentProcessMessage: { args: { input: string; chatId: string }; return: string };
	agentGetChats: { args: void; return: Chat[] };
	agentGetChat: { args: { chatId: string }; return: Chat | undefined };
	agentDeleteChat: { args: { chatId: string }; return: void };
};

export type RpcHandlers = {
	[M in keyof RpcMethods]: (
		args: RpcMethods[M]['args'],
	) => RpcMethods[M]['return'] | Promise<RpcMethods[M]['return']>;
};

export type RpcRequest = {
	id: number;
	method: keyof RpcMethods;
	args: unknown;
};

export type RpcResponse = {
	id: number;
	result?: unknown;
	error?: { message: string; code: string };
};
