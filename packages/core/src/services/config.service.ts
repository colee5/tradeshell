import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import { CHAIN_BY_ID, type SerializableChain } from '../constants/chains.js';
import { CONFIG_EVENTS } from '../constants/events.js';
import { CONFIG_PATH, TRADESHELL_DIR } from '../constants/paths.js';
import type { BlockchainConfig, Config, LlmConfig } from '../types/config.types.js';
import { BadRequestError } from './errors.js';
import { createLogger } from './logger.js';

export class ConfigService {
	private readonly logger = createLogger(ConfigService.name);

	private readonly errors = {
		loadFailed: (cause: unknown) => new BadRequestError(`Failed to load config: ${cause}`),
		saveFailed: (cause: unknown) => new BadRequestError(`Failed to save config: ${cause}`),
	};

	private readonly emitter: EventEmitter;
	private config: Config = {};

	constructor(deps: { emitter: EventEmitter }) {
		this.emitter = deps.emitter;
	}

	async init(): Promise<void> {
		const exists = await this.exists();

		if (exists) {
			this.logger.log('Loading existing config');
			await this.load();
		} else {
			this.logger.log('No config found, initializing empty config');
			await this.initEmpty();
		}
	}

	private async exists(): Promise<boolean> {
		try {
			await fs.access(CONFIG_PATH);
			return true;
		} catch {
			return false;
		}
	}

	async load(): Promise<Config> {
		try {
			const data = await fs.readFile(CONFIG_PATH, 'utf-8');
			const parsed = JSON.parse(data);

			this.config = parsed;
			return this.config;
		} catch (error) {
			this.logger.error('Failed to load config', error);
			throw this.errors.loadFailed(error);
		}
	}

	async save(config: Config): Promise<void> {
		try {
			await fs.mkdir(TRADESHELL_DIR, { recursive: true });
			await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

			this.config = config;
		} catch (error) {
			this.logger.error('Failed to save config', error);
			throw this.errors.saveFailed(error);
		}
	}

	async get(): Promise<Config> {
		return this.config;
	}

	private async initEmpty(): Promise<Config> {
		const emptyConfig: Config = {};

		await this.save(emptyConfig);
		return emptyConfig;
	}

	async updateLlm(llm: LlmConfig): Promise<Config> {
		this.logger.log('Updating LLM config');
		this.config.llm = llm;
		await this.save(this.config);
		this.emitter.emit(CONFIG_EVENTS.LLM_UPDATED);
		return this.config;
	}

	async updateBlockchain(blockchain: BlockchainConfig): Promise<Config> {
		this.logger.log('Updating blockchain config');
		this.config.blockchain = blockchain;
		await this.save(this.config);

		this.emitter.emit(CONFIG_EVENTS.BLOCKCHAIN_UPDATED);
		return this.config;
	}

	getChains(): { chains: SerializableChain[] } {
		const chains = Object.values(CHAIN_BY_ID).map((chain) => ({
			id: chain.id,
			name: chain.name,
			nativeCurrency: chain.nativeCurrency,
			rpcUrls: chain.rpcUrls,
			blockExplorers: chain.blockExplorers,
		}));

		return { chains };
	}
}
