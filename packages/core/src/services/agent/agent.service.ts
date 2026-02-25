import { APICallError, generateText, stepCountIs, type LanguageModel, type ModelMessage } from 'ai';
import { type EventEmitter } from 'events';
import { CONFIG_EVENTS } from '../../constants/events.js';
import { AgentResponseType, ContentPartType, type AgentResponse } from '../../types/agent.types.js';
import type { BlockchainService } from '../blockchain.service.js';
import type { ConfigService } from '../config.service.js';
import { BadRequestError, LlmError, NotInitializedError } from '../errors.js';
import { createLogger } from '../logger.js';
import type { WalletService } from '../wallet.service.js';
import { ChatsService } from './chats.service.js';
import { createModel } from './providers.js';
import { createTools } from './tools/index.js';

const SYSTEM_PROMPT = [
	'You are a helpful trading assistant.',
	'Do not ask the user for confirmation before calling a tool — tools that need approval have their own confirmation mechanism.',
	'When a tool call is denied by the user, do not retry it. Inform the user that the action was not performed.',
	'When the user asks to see information before performing an action, always present the information first and wait for the next step before proceeding.',
	'Never rely on previously fetched balances or blockchain data from the conversation history — always call the appropriate tool to get fresh data.',
	'If a tool fails because the wallet or blockchain client is not initialized, tell the user to unlock their wallet by running /wallet unlock.',
].join(' ');

type PendingApproval = {
	messages: ModelMessage[];
	unsavedMessages: ModelMessage[];
	approvalIds: string[];
	toolsCalled: string[];
};

export class AgentService {
	private readonly logger = createLogger(AgentService.name);

	private readonly errors = {
		notConfigured: () =>
			new NotInitializedError('LLM is not configured. Please set up your LLM provider first.'),
		apiCallFailed: (message: string, statusCode?: number) => new LlmError(message, statusCode),
		unknown: (error: unknown) =>
			new LlmError(error instanceof Error ? error.message : 'Unknown error'),
		noPendingApproval: (chatId: string) =>
			new BadRequestError(`No pending approval for chat: ${chatId}`),
		approvalIdMismatch: () => new BadRequestError('Approval ID does not match pending approval'),
	};

	private readonly chatsService: ChatsService;
	private readonly configService: ConfigService;
	private readonly emitter: EventEmitter;
	private readonly pendingApprovals = new Map<string, PendingApproval>();
	private model: LanguageModel | undefined;
	private readonly tools;

	constructor(deps: {
		chatsService: ChatsService;
		configService: ConfigService;
		blockchainService: BlockchainService;
		walletService: WalletService;
		emitter: EventEmitter;
	}) {
		this.chatsService = deps.chatsService;
		this.configService = deps.configService;
		this.emitter = deps.emitter;
		this.tools = createTools({
			blockchainService: deps.blockchainService,
			configService: deps.configService,
			walletService: deps.walletService,
		});
		this.emitter.on(CONFIG_EVENTS.LLM_UPDATED, () => this.handleLlmConfigUpdated());
	}

	async tryInitialize(): Promise<boolean> {
		const config = await this.configService.get();

		if (!config?.llm?.provider) {
			return false;
		}

		this.model = createModel(config.llm);
		this.logger.log(`Model initialized (${config.llm.provider}/${config.llm.model})`);

		return true;
	}

	async processMessage(input: string, chatId: string): Promise<AgentResponse> {
		if (!this.model) {
			throw this.errors.notConfigured();
		}

		const chat = await this.chatsService.getChat(chatId);

		if (!chat) {
			const name = await this.generateChatName(input);
			await this.chatsService.createChat(name, chatId);
		}

		const userMessage: ModelMessage = { role: 'user', content: input };
		const messages: ModelMessage[] = [...(chat?.messages ?? []), userMessage];

		await this.chatsService.addMessages(chatId, [userMessage]);

		return this.generate(chatId, messages);
	}

	async decideToolCalls(
		chatId: string,
		decisions: Array<{ approvalId: string; approved: boolean }>,
	): Promise<AgentResponse> {
		if (!this.model) {
			throw this.errors.notConfigured();
		}

		const pending = this.pendingApprovals.get(chatId);

		if (!pending) {
			throw this.errors.noPendingApproval(chatId);
		}

		const pendingSet = new Set(pending.approvalIds);

		for (const decision of decisions) {
			if (!pendingSet.has(decision.approvalId)) {
				throw this.errors.approvalIdMismatch();
			}
		}

		this.pendingApprovals.delete(chatId);

		const finalDecisions = pending.approvalIds.map((approvalId) => {
			const decision = decisions.find((d) => d.approvalId === approvalId);
			return {
				approvalId,
				approved: decision?.approved ?? false,
			};
		});

		const allDenied = finalDecisions.every((d) => !d.approved);

		if (allDenied) {
			return { type: AgentResponseType.TEXT, text: 'Action cancelled.', toolsCalled: [] };
		}

		const approvalMessage: ModelMessage = {
			role: 'tool',
			content: finalDecisions.map((decision) => ({
				type: ContentPartType.TOOL_APPROVAL_RESPONSE,
				approvalId: decision.approvalId,
				approved: decision.approved,
			})),
		};

		const messages: ModelMessage[] = [...pending.messages, approvalMessage];

		// Persist the generation messages from before the approval + the approval response
		await this.chatsService.addMessages(chatId, [...pending.unsavedMessages, approvalMessage]);

		const response = await this.generate(chatId, messages);

		if (response.type === AgentResponseType.TEXT) {
			const merged = [...new Set([...pending.toolsCalled, ...response.toolsCalled])];
			return { ...response, toolsCalled: merged };
		}

		return response;
	}

	private async generate(chatId: string, messages: ModelMessage[]): Promise<AgentResponse> {
		try {
			const result = await generateText({
				model: this.model!,
				system: SYSTEM_PROMPT,
				tools: this.tools,
				stopWhen: stepCountIs(5),
				messages,
			});

			const approvalRequests = result.content.filter(
				(part) => part.type === ContentPartType.TOOL_APPROVAL_REQUEST,
			);

			if (approvalRequests.length > 0) {
				const requests = approvalRequests.map((part) => {
					if (part.type !== ContentPartType.TOOL_APPROVAL_REQUEST) {
						throw new Error('Unexpected content part type');
					}

					const toolDef = this.tools[part.toolCall.toolName as keyof typeof this.tools];

					return {
						approvalId: part.approvalId,
						toolName: part.toolCall.toolName,
						description: toolDef?.description ?? '',
						args: part.toolCall.input as Record<string, unknown>,
					};
				});

				const toolsCalled = result.steps
					.flatMap((step) => step.toolCalls.map((tc) => tc.toolName))
					.filter((name, i, arr) => arr.indexOf(name) === i);

				this.pendingApprovals.set(chatId, {
					messages: [...messages, ...result.response.messages],
					unsavedMessages: result.response.messages,
					approvalIds: requests.map((r) => r.approvalId),
					toolsCalled,
				});

				return {
					type: AgentResponseType.APPROVAL_REQUEST,
					approvals: requests,
				};
			}

			await this.chatsService.addMessages(chatId, result.response.messages);

			const toolsCalled = result.steps
				.flatMap((step) => step.toolCalls.map((tc) => tc.toolName))
				.filter((name, i, arr) => arr.indexOf(name) === i);

			return { type: AgentResponseType.TEXT, text: result.text, toolsCalled };
		} catch (error) {
			if (APICallError.isInstance(error)) {
				throw this.errors.apiCallFailed(error.message, error.statusCode);
			}

			throw this.errors.unknown(error);
		}
	}

	private async generateChatName(input: string): Promise<string> {
		const { text } = await generateText({
			model: this.model!,
			system:
				'Summarize the user message into a short chat title (max 5 words). Return only the title, nothing else.',
			prompt: input,
		});

		return text.trim();
	}

	private async handleLlmConfigUpdated() {
		this.logger.log('LLM config updated, reinitializing model...');
		this.model = undefined;

		await this.tryInitialize();
	}
}
