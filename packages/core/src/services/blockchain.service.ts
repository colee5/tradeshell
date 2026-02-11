import { EventEmitter } from 'events';
import { createPublicClient, createWalletClient, http } from 'viem';
import type { PublicClient, WalletClient } from 'viem';
import { CHAIN_BY_ID } from '../constants/chains.js';
import { CONFIG_EVENTS, WALLET_EVENTS } from '../constants/events.js';
import type { Config } from '../types/config.types.js';
import type { ConfigService } from './config.service.js';
import type { WalletService } from './wallet.service.js';
import { createLogger } from './logger.js';

// TODO: Emitt re-initialization event when we change the active wallet
export class BlockchainService {
	private readonly logger = createLogger(BlockchainService.name);
	private publicClient: PublicClient | null = null;
	private walletClient: WalletClient | null = null;
	private config: Config | null = null;

	constructor(
		private readonly configService: ConfigService,
		private readonly walletService: WalletService,
		private readonly emitter: EventEmitter,
	) {
		// Wire up event listeners
		this.emitter.on(CONFIG_EVENTS.BLOCKCHAIN_UPDATED, () => this.handleBlockchainConfigUpdated());
		this.emitter.on(WALLET_EVENTS.UNLOCKED, () => this.handleWalletUnlocked());
		this.emitter.on(WALLET_EVENTS.SWITCHED, () => this.handleWalletSwitched());
		this.emitter.on(WALLET_EVENTS.LOCKED, () => this.handleWalletLocked());
	}

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

	private handleBlockchainConfigUpdated() {
		this.logger.log('Blockchain config updated, reinitializing clients...');

		this.publicClient = null;
		this.walletClient = null;
		this.tryInitialize();
	}

	private handleWalletUnlocked() {
		this.logger.log('Wallet unlocked, initializing wallet client...');

		if (this.isInitialized()) {
			try {
				this.initializeWalletClient();
			} catch (error) {
				this.logger.error('Failed to initialize wallet client', error);
			}
		}
	}

	private handleWalletSwitched() {
		this.logger.log('Active wallet switched, reinitializing wallet client...');

		if (this.isInitialized()) {
			try {
				this.initializeWalletClient();
			} catch (error) {
				this.logger.error('Failed to initialize wallet client', error);
			}
		}
	}

	private handleWalletLocked() {
		this.logger.log('Wallet locked, clearing wallet client...');
		this.clearWalletClient();
	}
}
