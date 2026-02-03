import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs/promises';
import { TRADESHELL_DIR, WALLETS_FILE } from 'src/common/constants';
import { Hash } from 'viem';
import type { PrivateKeyAccount } from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import {
	decryptMasterKey,
	decryptPrivateKey,
	EncryptedData,
	encryptMasterKey,
	encryptPrivateKey,
	generateMasterKey,
	MasterKeyData,
} from './crypto.utils';
import { WALLET_EVENTS } from './wallet.events';

interface StoredWallet {
	address: string;
	name: string;
	isActive: boolean;
	encryptedPrivateKey: EncryptedData;
}

interface WalletsFile {
	masterKeyData: MasterKeyData;
	wallets: Record<string, StoredWallet>;
}

@Injectable()
export class WalletService {
	private readonly logger = new Logger(WalletService.name);

	// If set, system is unlocked
	private masterKey: Buffer | null = null;
	private wallets: Map<string, StoredWallet> = new Map();

	constructor(private readonly eventEmitter: EventEmitter2) {
		this.loadWallets();
	}

	private async ensureDir(): Promise<void> {
		await fs.mkdir(TRADESHELL_DIR, { recursive: true });
	}

	private async loadWallets(): Promise<void> {
		try {
			const data = await fs.readFile(WALLETS_FILE, 'utf-8');
			const file: WalletsFile = JSON.parse(data);
			this.wallets = new Map(Object.entries(file.wallets));

			this.logger.log(`Loaded ${this.wallets.size} wallet(s) metadata`);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				this.wallets = new Map();
			} else {
				this.logger.error('Failed to load wallets file', error);
				this.wallets = new Map();
			}
		}
	}

	private async saveWalletsFile(masterKeyData: MasterKeyData): Promise<void> {
		await this.ensureDir();

		const file: WalletsFile = {
			masterKeyData,
			wallets: Object.fromEntries(this.wallets),
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

	isSetup(): boolean {
		return this.wallets.size > 0 || this.masterKey !== null;
	}

	isUnlocked(): boolean {
		return this.masterKey !== null;
	}

	async setup(password: string): Promise<void> {
		const existingFile = await this.readWalletsFile();

		if (existingFile) {
			throw new BadRequestException('Wallet system already set up. Use change password instead.');
		}

		const generatedMasterKey = generateMasterKey();
		const masterKeyData = encryptMasterKey(generatedMasterKey, password);

		this.masterKey = generatedMasterKey;
		this.wallets = new Map();

		await this.saveWalletsFile(masterKeyData);
		this.logger.log('Wallet system initialized with master password');
	}

	async unlock(password: string): Promise<void> {
		const file = await this.readWalletsFile();

		if (!file) {
			throw new NotFoundException('Wallet system not set up. Call setup first.');
		}

		try {
			this.masterKey = decryptMasterKey(file.masterKeyData, password);
		} catch {
			throw new UnauthorizedException('Invalid password');
		}

		// Stores them in memory
		this.wallets = new Map(Object.entries(file.wallets));
		this.eventEmitter.emit(WALLET_EVENTS.UNLOCKED);

		this.logger.log(`Unlocked ${this.wallets.size} wallet(s)`);
	}

	lock(): void {
		this.masterKey = null;
		this.eventEmitter.emit(WALLET_EVENTS.LOCKED);
		this.logger.log('All wallets locked');
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void> {
		const file = await this.readWalletsFile();
		if (!file) {
			throw new NotFoundException('Wallet system not set up');
		}

		// Verify old password
		let masterKey: Buffer;

		try {
			masterKey = decryptMasterKey(file.masterKeyData, oldPassword);
		} catch {
			throw new UnauthorizedException('Invalid current password');
		}

		// Re-encrypt master key with new password
		const newMasterKeyData = encryptMasterKey(masterKey, newPassword);

		// Save with new encryption (wallet data unchanged)
		await this.saveWalletsFile(newMasterKeyData);
		this.logger.log('Master password changed successfully');
	}

	async addWallet(privateKey: string, name: string, setActive = true): Promise<string> {
		if (!this.masterKey) {
			throw new UnauthorizedException('Wallets are locked. Unlock first.');
		}

		// Normalize private key format
		const normalizedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

		// Create account to get address
		const account = privateKeyToAccount(normalizedKey as Hash);
		const address = account.address.toLowerCase();

		if (this.wallets.has(address)) {
			throw new BadRequestException('Wallet already exists');
		}

		// If setActive, mark all other wallets as inactive
		if (setActive) {
			for (const wallet of this.wallets.values()) {
				wallet.isActive = false;
			}
		}

		// Encrypt and store
		const encryptedPrivateKey = encryptPrivateKey(normalizedKey, this.masterKey);

		const wallet: StoredWallet = {
			address: account.address, // Keep original case for display
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

		this.eventEmitter.emit(WALLET_EVENTS.UNLOCKED);
		this.logger.log(`Wallet added: ${account.address} (${name})`);

		return account.address;
	}

	async deleteWallet(address: string): Promise<void> {
		const normalizedAddress = address.toLowerCase();

		if (!this.wallets.has(normalizedAddress)) {
			throw new NotFoundException('Wallet not found');
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
			this.eventEmitter.emit(WALLET_EVENTS.UNLOCKED);
		}

		this.logger.log(`Wallet deleted: ${address}`);
	}

	async setActiveWallet(address: string): Promise<void> {
		const normalizedAddress = address.toLowerCase();

		if (!this.wallets.has(normalizedAddress)) {
			throw new NotFoundException('Wallet not found');
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

		this.eventEmitter.emit(WALLET_EVENTS.UNLOCKED);
		this.logger.log(`Active wallet set: ${address}`);
	}

	getActiveAccount(): PrivateKeyAccount | null {
		if (!this.masterKey) return null;

		const activeInfo = this.getActiveAccountInfo();
		if (!activeInfo) return null;

		const privateKey = decryptPrivateKey(activeInfo.encryptedPrivateKey, this.masterKey);
		return privateKeyToAccount(privateKey as `0x${string}`);
	}

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
}
