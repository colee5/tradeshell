import type {
	BlockchainConfig,
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
	walletAdd: {
		args: { privateKey: string; name: string; setActive?: boolean };
		return: { address: string };
	};
	walletList: { args: void; return: { wallets: WalletInfo[] } };
	walletGetStatus: { args: void; return: WalletStatus };
	walletSetActive: { args: { address: string }; return: void };
	walletDelete: { args: { address: string }; return: void };
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
