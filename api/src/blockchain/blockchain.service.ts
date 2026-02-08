import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CHAIN_BY_ID } from 'src/common/chains';
import { CONFIG_EVENTS } from 'src/config/config.events';
import { ConfigService } from 'src/config/config.service';
import { ConfigDto } from 'src/config/dto/config.dto';
import { WALLET_EVENTS } from 'src/wallet/wallet.events';
import { WalletService } from 'src/wallet/wallet.service';
import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem';

@Injectable()
export class BlockchainService {
	private readonly logger = new Logger(BlockchainService.name);
	private publicClient: PublicClient | null = null;
	private walletClient: WalletClient | null = null;
	private config: ConfigDto | null = null;

	constructor(
		private readonly configService: ConfigService,
		private readonly walletService: WalletService,
	) {}

	async tryInitialize(): Promise<boolean> {
		const savedConfig = await this.configService.get();

		if (!savedConfig?.blockchain?.chainId || !savedConfig?.blockchain?.rpcUrl) {
			return false;
		}

		this.config = savedConfig;
		this.initializeClients();

		return true;
	}

	private initializeClients(): void {
		const { chainId, rpcUrl } = this.config!.blockchain!;

		const chain = CHAIN_BY_ID[chainId];

		if (!chain) {
			throw new Error(`Unsupported chainId: ${chainId}`);
		}

		this.publicClient = createPublicClient({
			chain,
			transport: http(rpcUrl),
		});

		// Initialize wallet client if a wallet is unlocked
		const account = this.walletService.getActiveAccount();
		if (account) {
			this.walletClient = createWalletClient({
				account,
				chain,
				transport: http(rpcUrl),
			});
			this.logger.log(`Wallet client initialized for account: ${account.address}`);
		}

		this.logger.log(`Blockchain clients initialized (chainId: ${chainId}, rpcUrl: ${rpcUrl})`);
	}

	getPublicClient(): PublicClient {
		if (!this.publicClient) {
			throw new Error('Blockchain not initialized yet');
		}
		return this.publicClient;
	}

	getWalletClient(): WalletClient {
		if (!this.walletClient) {
			throw new Error('Wallet client not initialized. Please unlock a wallet first.');
		}
		return this.walletClient;
	}

	// Initialize or update the wallet client when a wallet is unlocked
	initializeWalletClient(): void {
		if (!this.config?.blockchain?.chainId || !this.config?.blockchain?.rpcUrl) {
			throw new Error('Blockchain not configured');
		}

		const account = this.walletService.getActiveAccount();
		if (!account) {
			throw new Error('No wallet unlocked');
		}

		const { chainId, rpcUrl } = this.config.blockchain;
		const chain = CHAIN_BY_ID[chainId];

		this.walletClient = createWalletClient({
			account,
			chain,
			transport: http(rpcUrl),
		});

		this.logger.log(`Wallet client initialized for account: ${account.address}`);
	}

	clearWalletClient(): void {
		this.walletClient = null;
		this.logger.log('Wallet client cleared');
	}

	isInitialized(): boolean {
		return !!this.publicClient;
	}

	@OnEvent(CONFIG_EVENTS.BLOCKCHAIN_UPDATED)
	handleBlockchainConfigUpdated() {
		this.logger.log('Blockchain config updated, reinitializing clients...');

		this.publicClient = null;
		this.walletClient = null;
		this.tryInitialize();
	}

	@OnEvent(WALLET_EVENTS.UNLOCKED)
	handleWalletUnlocked() {
		this.logger.log('Wallet unlocked, initializing wallet client...');

		if (this.isInitialized()) {
			try {
				this.initializeWalletClient();
			} catch (error) {
				this.logger.error('Failed to initialize wallet client', error);
			}
		}
	}

	@OnEvent(WALLET_EVENTS.LOCKED)
	handleWalletLocked() {
		this.logger.log('Wallet locked, clearing wallet client...');
		this.clearWalletClient();
	}
}
