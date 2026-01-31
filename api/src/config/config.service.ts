import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { BlockchainConfigDto, ConfigDto, LlmConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService implements OnModuleInit {
	private config: ConfigDto = {};
	private readonly configDir: string;
	private readonly configPath: string;

	constructor() {
		this.configDir = path.join(os.homedir(), '.tradeshell');
		this.configPath = path.join(this.configDir, 'config.json');
	}

	async onModuleInit() {
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
		return this.config;
	}

	async updateBlockchain(blockchain: BlockchainConfigDto): Promise<ConfigDto> {
		this.config.blockchain = blockchain;
		await this.save(this.config);
		return this.config;
	}

	getConfigPath(): string {
		return this.configPath;
	}
}
