import { BlockchainService, ConfigService, WalletService } from '@tradeshell/core';
import { EventEmitter } from 'events';
import type { RpcHandlers, RpcRequest } from './rpc.types.js';
import { validateRpcArgs } from './validation.js';

const emitter = new EventEmitter();
const configService = new ConfigService(emitter);
const walletService = new WalletService(emitter);

// cole: we list all services which are purely for event-driven logic this way
void new BlockchainService(configService, walletService, emitter);

await configService.init();

const handlers: RpcHandlers = {
	// Config
	getConfig: () => configService.get(),
	updateLlmConfig: (args) => configService.updateLlm(args),
	updateBlockchainConfig: (args) => configService.updateBlockchain(args),
	resetConfig: async () => {
		await configService.save({});
		return configService.get();
	},
	getChains: () => configService.getChains(),

	// Wallet
	walletSetup: (args) => walletService.setup(args.password),
	walletUnlock: (args) => walletService.unlock(args.password),
	walletLock: () => walletService.lock(),
	walletCheckPassword: (args) => walletService.checkPassword(args.password),
	walletChangePassword: (args) => walletService.changePassword(args.oldPassword, args.newPassword),
	walletAdd: async (args) => {
		const address = await walletService.addWallet(
			args.privateKey,
			args.name,
			args.setActive ?? true,
		);
		return { address };
	},
	walletList: () => ({ wallets: walletService.getWallets() }),
	walletGetStatus: () => ({
		isSetup: walletService.isSetup(),
		isUnlocked: walletService.isUnlocked(),
		activeAddress: walletService.getActiveAccountInfo()?.address ?? null,
		activeName: walletService.getActiveAccountInfo()?.name ?? null,
		walletCount: walletService.getWalletCount(),
	}),
	walletSetActive: (args) => walletService.setActiveWallet(args.address),
	walletDelete: (args) => walletService.deleteWallet(args.address),
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
