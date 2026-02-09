import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import type { Hash } from 'viem';
import type { PrivateKeyAccount } from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { WALLET_EVENTS } from '../constants/events.js';
import { TRADESHELL_DIR, WALLETS_FILE } from '../constants/paths.js';
import type { EncryptedData, MasterKeyData } from '../utils/crypto.utils.js';
import {
	decryptMasterKey,
	decryptPrivateKey,
	encryptMasterKey,
	encryptPrivateKey,
	generateMasterKey,
} from '../utils/crypto.utils.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from './errors.js';
import { createLogger } from './logger.js';

type StoredWallet = {
	address: string;
	name: string;
	isActive: boolean;
	encryptedPrivateKey: EncryptedData;
};

type WalletsFile = {
	masterKeyData: MasterKeyData;
	wallets: Record<string, StoredWallet>;
};

export class WalletService {
	private readonly logger = createLogger('WalletService');

	private readonly errors = {
		alreadySetup: () =>
			new BadRequestError('Wallet system already set up. Use change password instead.'),
		notSetup: () => new NotFoundError('Wallet system not set up. Call setup first.'),
		invalidPassword: () => new UnauthorizedError('Invalid password'),
		walletsLocked: () => new UnauthorizedError('Wallets are locked. Unlock first.'),
		walletExists: () => new BadRequestError('Wallet already exists'),
		walletNotFound: (address: string) => new NotFoundError(`Wallet not found: ${address}`),
	};

	private masterKey: Buffer | null = null;
	private wallets: Map<string, StoredWallet> = new Map();
	private walletsFileExists = false;

	constructor(private readonly emitter: EventEmitter) {
		this.loadWallets();
	}

	private async ensureDir(): Promise<void> {
		await fs.mkdir(TRADESHELL_DIR, { recursive: true });
	}

	// loadWallets runs only on start and pushes the current stored wallet metadata into memory
	// Then when the system is unlocked, it stores the masterKey in memory too (decrypted)
	// which is used to access the private key of the active current account.
	private async loadWallets(): Promise<void> {
		const file = await this.readWalletsFile();

		if (file) {
			this.walletsFileExists = true;
			this.wallets = new Map(Object.entries(file.wallets));
			this.logger.log(`Loaded ${this.wallets.size} wallet(s) metadata into memory`);
		} else {
			this.wallets = new Map();
		}
	}

	// I/O operations from file system
	private async saveWalletsFile(masterKeyData: MasterKeyData): Promise<void> {
		await this.ensureDir();

		const currentWallets = Object.fromEntries(this.wallets);

		const file: WalletsFile = {
			masterKeyData,
			wallets: currentWallets,
		};

		await fs.writeFile(WALLETS_FILE, JSON.stringify(file, null, 2), 'utf-8');
	}

	private async readWalletsFile(): Promise<WalletsFile | null> {
		try {
			const data = await fs.readFile(WALLETS_FILE, 'utf-8');
			return JSON.parse(data);
		} catch {
			return null;
		}
	}

	async setup(password: string): Promise<void> {
		const existingFile = await this.readWalletsFile();

		if (existingFile) {
			throw this.errors.alreadySetup();
		}

		const generatedMasterKey = generateMasterKey();
		const masterKeyData = encryptMasterKey(generatedMasterKey, password);

		this.masterKey = generatedMasterKey;
		this.wallets = new Map();

		await this.saveWalletsFile(masterKeyData);
		this.walletsFileExists = true;
		this.logger.log('Wallet system initialized with master password');
	}

	lock(): void {
		this.masterKey = null;
		this.emitter.emit(WALLET_EVENTS.LOCKED);
		this.logger.log('All wallets locked');
	}

	async unlock(password: string): Promise<void> {
		const file = await this.readWalletsFile();

		if (!file) {
			throw this.errors.notSetup();
		}

		try {
			this.masterKey = decryptMasterKey(file.masterKeyData, password);
		} catch {
			throw this.errors.invalidPassword();
		}

		this.wallets = new Map(Object.entries(file.wallets));
		this.emitter.emit(WALLET_EVENTS.UNLOCKED);

		this.logger.log(`Unlocked ${this.wallets.size} wallet(s)`);
	}

	async checkPassword(password: string): Promise<void> {
		const file = await this.readWalletsFile();

		if (!file) {
			throw this.errors.notSetup();
		}

		try {
			decryptMasterKey(file.masterKeyData, password);
		} catch {
			throw this.errors.invalidPassword();
		}
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void> {
		const file = await this.readWalletsFile();

		if (!file) {
			throw this.errors.notSetup();
		}

		// 1. Verify old password is correct by decrypting the master key with it
		let masterKey: Buffer;

		try {
			masterKey = decryptMasterKey(file.masterKeyData, oldPassword);
		} catch {
			throw this.errors.invalidPassword();
		}

		// 2. Re-encrypt master key with new password
		const newMasterKeyData = encryptMasterKey(masterKey, newPassword);

		// 3. Save with new encryption (wallet data unchanged)
		await this.saveWalletsFile(newMasterKeyData);
		this.logger.log('Master password changed successfully');
	}

	async addWallet(privateKey: string, name: string, setActive = true): Promise<string> {
		if (!this.isUnlocked()) {
			throw this.errors.walletsLocked();
		}

		// Create account to get address
		const account = privateKeyToAccount(privateKey as Hash);
		const address = account.address.toLowerCase();

		if (this.wallets.has(address)) {
			throw this.errors.walletExists();
		}

		// If setActive, mark all other wallets as inactive
		if (setActive) {
			for (const wallet of this.wallets.values()) {
				wallet.isActive = false;
			}
		}

		// Encrypt and store
		const encryptedPrivateKey = encryptPrivateKey(privateKey, this.masterKey!);

		const wallet = {
			address: account.address,
			name,
			isActive: setActive,
			encryptedPrivateKey,
		};

		this.wallets.set(address, wallet);

		// Save to file
		const file = await this.readWalletsFile();

		if (file) {
			await this.saveWalletsFile(file.masterKeyData);
		}

		this.emitter.emit(WALLET_EVENTS.UNLOCKED);
		this.logger.log(`Wallet added: ${account.address} (${name})`);

		return account.address;
	}

	async deleteWallet(address: string): Promise<void> {
		const normalizedAddress = address.toLowerCase();

		if (!this.wallets.has(normalizedAddress)) {
			throw this.errors.walletNotFound(address);
		}

		const wasActive = this.wallets.get(normalizedAddress)?.isActive;
		this.wallets.delete(normalizedAddress);

		// If deleted wallet was active, set another as active
		if (wasActive && this.wallets.size > 0) {
			const firstWallet = this.wallets.values().next().value;
			if (firstWallet) {
				firstWallet.isActive = true;
			}
		}

		// Save to file
		const file = await this.readWalletsFile();
		if (file) {
			await this.saveWalletsFile(file.masterKeyData);
		}

		if (wasActive) {
			this.emitter.emit(WALLET_EVENTS.UNLOCKED);
		}

		this.logger.log(`Wallet deleted: ${address}`);
	}

	async setActiveWallet(address: string): Promise<void> {
		const normalizedAddress = address.toLowerCase();

		if (!this.wallets.has(normalizedAddress)) {
			throw this.errors.walletNotFound(address);
		}

		// Mark all as inactive, then set the target as active
		for (const wallet of this.wallets.values()) {
			wallet.isActive = false;
		}

		this.wallets.get(normalizedAddress)!.isActive = true;

		// Save to file
		const file = await this.readWalletsFile();
		if (file) {
			await this.saveWalletsFile(file.masterKeyData);
		}

		this.emitter.emit(WALLET_EVENTS.UNLOCKED);
		this.logger.log(`Active wallet set: ${address}`);
	}

	getActiveAccount(): PrivateKeyAccount | null {
		if (!this.isUnlocked()) return null;

		const activeInfo = this.getActiveAccountInfo();
		if (!activeInfo) return null;

		const privateKey = decryptPrivateKey(activeInfo.encryptedPrivateKey, this.masterKey!);
		return privateKeyToAccount(privateKey as Hash);
	}

	// Returns the wallet data such as address, name, isActive
	getActiveAccountInfo(): StoredWallet | null {
		for (const wallet of this.wallets.values()) {
			if (wallet.isActive) {
				return wallet;
			}
		}

		return null;
	}

	getWallets(): Array<{ address: string; name: string; isActive: boolean }> {
		const wallets = Array.from(this.wallets.values()).map((w) => ({
			address: w.address,
			name: w.name,
			isActive: w.isActive,
		}));

		return wallets;
	}

	getWalletCount(): number {
		return this.wallets.size;
	}

	isSetup(): boolean {
		return this.walletsFileExists;
	}

	isUnlocked(): boolean {
		return this.masterKey !== null;
	}
}
