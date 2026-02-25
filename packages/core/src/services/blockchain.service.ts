import { EventEmitter } from 'events';
import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { createPublicClient, createWalletClient, http } from 'viem';
import { CHAIN_BY_ID } from '../constants/chains.js';
import { CONFIG_EVENTS, WALLET_EVENTS } from '../constants/events.js';
import type { Config } from '../types/config.types.js';
import type { ConfigService } from './config.service.js';
import { BadRequestError, NotInitializedError } from './errors.js';
import { createLogger } from './logger.js';
import type { WalletService } from './wallet.service.js';

export class BlockchainService {
	private readonly logger = createLogger(BlockchainService.name);

	private readonly errors = {
		unsupportedChain: (chainId: number) => new BadRequestError(`Unsupported chainId: ${chainId}`),
		notInitialized: () => new NotInitializedError('Blockchain not initialized yet'),
		notConfigured: () => new NotInitializedError('Blockchain not configured'),
		walletNotReady: () =>
			new NotInitializedError('Wallet client not initialized. Please unlock a wallet first.'),
		noWalletUnlocked: () => new NotInitializedError('No wallet unlocked'),
	};

	private readonly configService: ConfigService;
	private readonly walletService: WalletService;
	private readonly emitter: EventEmitter;
	private publicClient: PublicClient | null = null;
	private walletClient: WalletClient<Transport, Chain, Account> | null = null;
	private config: Config | null = null;

	constructor(deps: {
		configService: ConfigService;
		walletService: WalletService;
		emitter: EventEmitter;
	}) {
		this.configService = deps.configService;
		this.walletService = deps.walletService;
		this.emitter = deps.emitter;
		this.emitter.on(CONFIG_EVENTS.BLOCKCHAIN_UPDATED, () => this.handleBlockchainConfigUpdated());
		this.emitter.on(WALLET_EVENTS.UNLOCKED, () => this.handleWalletUnlocked());
		this.emitter.on(WALLET_EVENTS.SWITCHED, () => this.handleWalletSwitched());
		this.emitter.on(WALLET_EVENTS.LOCKED, () => this.handleWalletLocked());
	}

	async tryInitialize(): Promise<boolean> {
		const savedConfig = await this.configService.get();

		if (!savedConfig?.blockchain?.chainId) {
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
			throw this.errors.unsupportedChain(chainId);
		}

		const transport = http(rpcUrl || undefined);

		this.publicClient = createPublicClient({
			chain,
			transport,
		});

		// Initialize wallet client if a wallet is unlocked
		const account = this.walletService.getActiveAccount();
		if (account) {
			this.walletClient = createWalletClient({
				account,
				chain,
				transport,
			});
			this.logger.log(`Wallet client initialized for account: ${account.address}`);
		}

		this.logger.log(
			`Blockchain clients initialized (chainId: ${chainId}, rpcUrl: ${rpcUrl ?? 'default'})`,
		);
	}

	getPublicClient(): PublicClient {
		if (!this.publicClient) {
			throw this.errors.notInitialized();
		}

		return this.publicClient;
	}

	getWalletClient(): WalletClient<Transport, Chain, Account> {
		if (!this.walletClient) {
			throw this.errors.walletNotReady();
		}

		return this.walletClient;
	}

	// Initialize or update the wallet client when a wallet is unlocked
	initializeWalletClient(): void {
		if (!this.config?.blockchain?.chainId) {
			throw this.errors.notConfigured();
		}

		const account = this.walletService.getActiveAccount();

		if (!account) {
			throw this.errors.noWalletUnlocked();
		}

		const { chainId, rpcUrl } = this.config.blockchain;
		const chain = CHAIN_BY_ID[chainId];

		this.walletClient = createWalletClient({
			account,
			chain,
			transport: http(rpcUrl || undefined),
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

	getExplorerUrl(hash: string): string | null {
		const explorer = this.publicClient?.chain?.blockExplorers?.default;
		return explorer ? `${explorer.url}/tx/${hash}` : null;
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
