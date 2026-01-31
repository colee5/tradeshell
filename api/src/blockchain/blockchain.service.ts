import { Injectable, OnModuleInit } from '@nestjs/common';
import { CHAIN_BY_ID } from 'src/common/chains';
import { ConfigService } from 'src/config/config.service';
import { ConfigDto } from 'src/config/dto/config.dto';
import { createPublicClient, http, PublicClient } from 'viem';

@Injectable()
export class BlockchainService {
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
}
