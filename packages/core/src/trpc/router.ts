import {
	agentDecideToolCallsSchema,
	agentProcessMessageSchema,
	chatIdSchema,
	type AgentResponse,
} from '../types/agent.types.js';
import type { Chat } from '../services/agent/chats.service.js';
import { blockchainConfigSchema, llmConfigSchema } from '../types/config.types.js';
import {
	addWalletInputSchema,
	walletAddressSchema,
	walletChangePasswordSchema,
	walletPasswordSchema,
} from '../types/wallet.types.js';
import type { AgentService } from '../services/agent/agent.service.js';
import type { ChatsService } from '../services/agent/chats.service.js';
import type { ConfigService } from '../services/config.service.js';
import type { WalletService } from '../services/wallet.service.js';
import { procedure, router } from './trpc.js';

export type RouterDeps = {
	configService: ConfigService;
	walletService: WalletService;
	agentService: AgentService;
	chatsService: ChatsService;
};

export function createAppRouter(deps: RouterDeps) {
	const { configService, walletService, agentService, chatsService } = deps;

	return router({
		// Config
		getConfig: procedure.query(() => configService.get()),

		updateLlmConfig: procedure
			.input(llmConfigSchema)
			.mutation(({ input }) => configService.updateLlm(input)),

		updateBlockchainConfig: procedure
			.input(blockchainConfigSchema)
			.mutation(({ input }) => configService.updateBlockchain(input)),

		resetConfig: procedure.mutation(() => configService.reset()),

		getChains: procedure.query(() => configService.getChains()),

		// Wallet
		walletSetup: procedure
			.input(walletPasswordSchema)
			.mutation(({ input }) => walletService.setup(input.password)),

		walletUnlock: procedure
			.input(walletPasswordSchema)
			.mutation(({ input }) => walletService.unlock(input.password)),

		walletLock: procedure.mutation(() => walletService.lock()),

		walletCheckPassword: procedure
			.input(walletPasswordSchema)
			.mutation(({ input }) => walletService.checkPassword(input.password)),

		walletChangePassword: procedure
			.input(walletChangePasswordSchema)
			.mutation(({ input }) => walletService.changePassword(input.oldPassword, input.newPassword)),

		walletAdd: procedure
			.input(addWalletInputSchema)
			.mutation(({ input }) =>
				walletService.addWallet(input.privateKey, input.name, input.setActive ?? true),
			),

		walletList: procedure.query(() => walletService.getWallets()),

		walletGetStatus: procedure.query(() => walletService.getStatus()),

		walletSetActive: procedure
			.input(walletAddressSchema)
			.mutation(({ input }) => walletService.setActiveWallet(input.address)),

		walletDelete: procedure
			.input(walletAddressSchema)
			.mutation(({ input }) => walletService.deleteWallet(input.address)),

		// Agent
		agentProcessMessage: procedure
			.input(agentProcessMessageSchema)
			.mutation(
				({ input }): Promise<AgentResponse> =>
					agentService.processMessage(input.input, input.chatId),
			),

		agentDecideToolCalls: procedure
			.input(agentDecideToolCallsSchema)
			.mutation(
				({ input }): Promise<AgentResponse> =>
					agentService.decideToolCalls(input.chatId, input.decisions),
			),

		agentGetChats: procedure.query((): Promise<Chat[]> => chatsService.getChats()),

		agentGetChat: procedure
			.input(chatIdSchema)
			.query(({ input }): Promise<Chat | undefined> => chatsService.getChat(input.chatId)),

		agentDeleteChat: procedure
			.input(chatIdSchema)
			.mutation(({ input }) => chatsService.deleteChat(input.chatId)),
	});
}

export type AppRouter = ReturnType<typeof createAppRouter>;
