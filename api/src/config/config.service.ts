import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs/promises';
import { CHAIN_BY_ID } from 'src/common/chains';
import { CONFIG_PATH, TRADESHELL_DIR } from 'src/common/constants';
import { CONFIG_EVENTS } from './config.events';
import { ChainsResponseDto } from './dto/chain.dto';
import { BlockchainConfigDto, ConfigDto, LlmConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService implements OnModuleInit {
	private config: ConfigDto = {};
	private readonly configDir = TRADESHELL_DIR;
	private readonly configPath = CONFIG_PATH;

	constructor(private readonly eventEmitter: EventEmitter2) {}

	async onModuleInit(): Promise<void> {
		const exists = await this.exists();

		if (exists) {
			await this.load();
		} else {
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

	async load(): Promise<ConfigDto> {
		try {
			const data = await fs.readFile(this.configPath, 'utf-8');
			const parsed = JSON.parse(data);

			this.config = parsed;
			return this.config;
		} catch (error) {
			throw new Error(`Failed to load config: ${error}`);
		}
	}

	async save(config: ConfigDto): Promise<void> {
		try {
			await fs.mkdir(this.configDir, { recursive: true });
			await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

			this.config = config;
		} catch (error) {
			throw new Error(`Failed to save config: ${error}`);
		}
	}

	async get(): Promise<ConfigDto> {
		return this.config;
	}

	private async initEmpty(): Promise<ConfigDto> {
		const emptyConfig: ConfigDto = {};

		await this.save(emptyConfig);
		return emptyConfig;
	}

	async updateLlm(llm: LlmConfigDto): Promise<ConfigDto> {
		this.config.llm = llm;
		await this.save(this.config);
		this.eventEmitter.emit(CONFIG_EVENTS.LLM_UPDATED);
		return this.config;
	}

	async updateBlockchain(blockchain: BlockchainConfigDto): Promise<ConfigDto> {
		this.config.blockchain = blockchain;
		await this.save(this.config);

		this.eventEmitter.emit(CONFIG_EVENTS.BLOCKCHAIN_UPDATED);
		return this.config;
	}

	getChains(): ChainsResponseDto {
		const chains = Object.values(CHAIN_BY_ID);
		return { chains };
	}
}
