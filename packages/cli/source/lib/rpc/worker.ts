import {
	AgentService,
	BlockchainService,
	ChatsService,
	ConfigService,
	WalletService,
} from '@tradeshell/core';
import { EventEmitter } from 'events';
import type { RpcHandlers, RpcRequest } from './rpc.types.js';
import { validateRpcArgs } from './validation.js';

const emitter = new EventEmitter();
const chatsService = new ChatsService();
const configService = new ConfigService({ emitter });
const walletService = new WalletService({ emitter });
const blockchainService = new BlockchainService({ configService, walletService, emitter });
const agentService = new AgentService({
	chatsService,
	configService,
	blockchainService,
	walletService,
	emitter,
});

await configService.init();
await chatsService.init();
await blockchainService.tryInitialize();
await agentService.tryInitialize();

const handlers: RpcHandlers = {
	// Config
	getConfig: () => configService.get(),
	updateLlmConfig: (args) => configService.updateLlm(args),
	updateBlockchainConfig: (args) => configService.updateBlockchain(args),
	resetConfig: () => configService.reset(),
	getChains: () => configService.getChains(),

	// Wallet
	walletSetup: (args) => walletService.setup(args.password),
	walletUnlock: (args) => walletService.unlock(args.password),
	walletLock: () => walletService.lock(),
	walletCheckPassword: (args) => walletService.checkPassword(args.password),
	walletChangePassword: (args) => walletService.changePassword(args.oldPassword, args.newPassword),
	walletAdd: (args) => walletService.addWallet(args.privateKey, args.name, args.setActive ?? true),
	walletList: () => walletService.getWallets(),
	walletGetStatus: () => walletService.getStatus(),
	walletSetActive: (args) => walletService.setActiveWallet(args.address),
	walletDelete: (args) => walletService.deleteWallet(args.address),

	// Agent
	agentProcessMessage: (args) => agentService.processMessage(args.input, args.chatId),
	agentDecideToolCalls: (args) => agentService.decideToolCalls(args.chatId, args.decisions),
	agentGetChats: () => chatsService.getChats(),
	agentGetChat: (args) => chatsService.getChat(args.chatId),
	agentDeleteChat: (args) => chatsService.deleteChat(args.chatId),
};

self.onmessage = async (event: MessageEvent<RpcRequest>) => {
	const { id, method, args } = event.data;
	const handler = handlers[method];

	if (!handler) {
		self.postMessage({ id, error: { message: `Unknown method: ${method}`, code: 'NOT_FOUND' } });
		return;
	}

	try {
		// Validate incoming arguments (throws BadRequestError if invalid)
		const validatedArgs = validateRpcArgs(method, args);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const result = await handler(validatedArgs as any);
		self.postMessage({ id, result });
	} catch (error: unknown) {
		const err = error as Error & { code?: string };
		self.postMessage({
			id,
			error: { message: err.message, code: err.code ?? 'UNKNOWN' },
		});
	}
};
