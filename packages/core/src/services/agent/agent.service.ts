import { APICallError, generateText, stepCountIs, type LanguageModel } from 'ai';
import { type EventEmitter } from 'events';
import { CONFIG_EVENTS } from '../../constants/events.js';
import { AGENT_ROLES } from '../../types/agent.types.js';
import type { BlockchainService } from '../blockchain.service.js';
import type { ConfigService } from '../config.service.js';
import { LlmError, NotInitializedError } from '../errors.js';
import { createLogger } from '../logger.js';
import { ChatsService } from './chats.service.js';
import { createModel } from './providers.js';
import { createTools } from './tools/index.js';

export class AgentService {
	private readonly logger = createLogger(AgentService.name);

	private readonly errors = {
		notConfigured: () =>
			new NotInitializedError('LLM is not configured. Please set up your LLM provider first.'),
		apiCallFailed: (message: string, statusCode?: number) => new LlmError(message, statusCode),
		unknown: (error: unknown) =>
			new LlmError(error instanceof Error ? error.message : 'Unknown error'),
	};

	private readonly tools;
	private model: LanguageModel | undefined;

	constructor(
		private readonly chatsService: ChatsService,
		private readonly configService: ConfigService,
		private readonly emitter: EventEmitter,
		blockchainService: BlockchainService,
	) {
		this.tools = createTools({ blockchainService });
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

	async processMessage(input: string, chatId: string): Promise<string> {
		if (!this.model) {
			throw this.errors.notConfigured();
		}

		const chat = await this.chatsService.getChat(chatId);

		if (!chat) {
			const name = await this.generateChatName(input);
			await this.chatsService.createChat(name, chatId);

			this.logger.log(`Started chat "${name}" (${chatId})`);
		}

		const messages = [...(chat?.messages ?? []), { role: AGENT_ROLES.USER, content: input }];

		await this.chatsService.addMessage(chatId, AGENT_ROLES.USER, input);

		try {
			const { text } = await generateText({
				model: this.model,
				tools: this.tools,
				stopWhen: stepCountIs(5),
				messages,
			});

			await this.chatsService.addMessage(chatId, AGENT_ROLES.ASSISTANT, text);

			return text;
		} catch (error) {
			if (APICallError.isInstance(error)) {
				this.logger.log(`API call failed (${error.statusCode}): ${error.message}`);
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
