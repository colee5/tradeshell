import {
	AgentService,
	BlockchainService,
	ChatsService,
	ConfigService,
	WalletService,
	createAppRouter,
} from '@tradeshell/core';
import { EventEmitter } from 'events';

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

const router = createAppRouter({ configService, walletService, agentService, chatsService });

export type { AppRouter } from '@tradeshell/core';
export { router };
