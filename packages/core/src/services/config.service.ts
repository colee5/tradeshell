import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import { CHAIN_BY_ID } from '../constants/chains.js';
import { CONFIG_EVENTS } from '../constants/events.js';
import { CONFIG_PATH, TRADESHELL_DIR } from '../constants/paths.js';
import type { BlockchainConfig, Config, LlmConfig } from '../types/config.types.js';
import { createLogger } from './logger.js';

export class ConfigService {
	private readonly logger = createLogger(ConfigService.name);
	private config: Config = {};
	private readonly configDir = TRADESHELL_DIR;
	private readonly configPath = CONFIG_PATH;

	constructor(private readonly emitter: EventEmitter) {}

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
			await fs.access(this.configPath);
			return true;
		} catch {
			return false;
		}
	}

	async load(): Promise<Config> {
		try {
			const data = await fs.readFile(this.configPath, 'utf-8');
			const parsed = JSON.parse(data);

			this.config = parsed;
			return this.config;
		} catch (error) {
			this.logger.error('Failed to load config', error);
			throw new Error(`Failed to load config: ${error}`);
		}
	}

	async save(config: Config): Promise<void> {
		try {
			await fs.mkdir(this.configDir, { recursive: true });
			await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

			this.config = config;
		} catch (error) {
			this.logger.error('Failed to save config', error);
			throw new Error(`Failed to save config: ${error}`);
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

	getChains() {
		const chains = Object.values(CHAIN_BY_ID);
		return { chains };
	}
}
