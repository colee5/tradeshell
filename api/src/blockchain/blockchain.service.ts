import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CHAIN_BY_ID } from 'src/common/chains';
import { CONFIG_EVENTS } from 'src/config/config.events';
import { ConfigService } from 'src/config/config.service';
import { ConfigDto } from 'src/config/dto/config.dto';
import { createPublicClient, http, PublicClient } from 'viem';

@Injectable()
export class BlockchainService {
	private readonly logger = new Logger(BlockchainService.name);
	private publicClient: PublicClient | null = null;
	private config: ConfigDto | null = null;

	constructor(private readonly configService: ConfigService) {}

	async tryInitialize(): Promise<boolean> {
		const savedConfig = await this.configService.get();

		if (!savedConfig?.blockchain?.chainId || !savedConfig?.blockchain?.rpcUrl) {
			return false;
		}

		this.config = savedConfig;
		this.initializeClients();

		return true;
	}

	private initializeClients() {
		const { chainId, rpcUrl } = this.config!.blockchain!;

		const chain = CHAIN_BY_ID[chainId];

		if (!chain) {
			throw new Error(`Unsupported chainId: ${chainId}`);
		}

		this.publicClient = createPublicClient({
			chain,
			transport: http(rpcUrl),
		});

		this.logger.log(`Blockchain clients initialized (chainId: ${chainId}, rpcUrl: ${rpcUrl})`);
	}

	getPublicClient(): PublicClient {
		if (!this.publicClient) {
			throw new Error('Blockchain not initialized yet');
		}
		return this.publicClient;
	}

	isInitialized(): boolean {
		return !!this.publicClient;
	}

	@OnEvent(CONFIG_EVENTS.BLOCKCHAIN_UPDATED)
	handleBlockchainConfigUpdated() {
		this.logger.log('Blockchain config updated, reinitializing clients...');

		this.publicClient = null;
		this.tryInitialize();
	}
}
