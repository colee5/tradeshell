import * as fs from 'fs/promises';
import * as path from 'path';
import { Transaction } from 'viem';
import { TRANSACTIONS_DIR } from '../constants/paths.js';
import { BadRequestError } from './errors.js';
import { createLogger } from './logger.js';

// Each wallet has a single JSON file of its transactions:
// ~/.tradeshell/transactions/{walletAddress}.json
export class TransactionService {
	private readonly logger = createLogger(TransactionService.name);

	private readonly errors = {
		saveFailed: (cause: unknown) => new BadRequestError(`Failed to save a transaction: ${cause}`),
		noTransactions: (walletAddress: string) =>
			new BadRequestError(`Wallet with address: ${walletAddress} does not have any transactions`),
		transactionNotFound: (transactionHash: string) =>
			new BadRequestError(`Transaction with hash: ${transactionHash} is not found`),
	};

	async init(): Promise<void> {
		await fs.mkdir(TRANSACTIONS_DIR, { recursive: true });
	}

	private walletFilePath(walletAddress: string): string {
		return path.join(TRANSACTIONS_DIR, `${walletAddress}.json`);
	}

	async exists(walletAddress: string): Promise<boolean> {
		try {
			await fs.access(this.walletFilePath(walletAddress));
			return true;
		} catch {
			return false;
		}
	}

	async saveTransaction(walletAddress: string, transaction: Transaction) {
		try {
			if (await this.exists(walletAddress)) {
				const existing: Transaction[] = JSON.parse(
					await fs.readFile(this.walletFilePath(walletAddress), 'utf-8'),
				);

				existing.push(transaction);

				await fs.writeFile(
					this.walletFilePath(walletAddress),
					JSON.stringify(existing, null, 2),
					'utf-8',
				);
			} else {
				await fs.writeFile(
					this.walletFilePath(walletAddress),
					JSON.stringify([transaction], null, 2),
					'utf-8',
				);
			}

			this.logger.log(`Saved transaction for wallet: ${walletAddress}`);
		} catch (cause) {
			throw this.errors.saveFailed(cause);
		}
	}

	async getTransactions(walletAddress: string): Promise<Transaction[]> {
		if (await this.exists(walletAddress)) {
			const transactions: Transaction[] = JSON.parse(
				await fs.readFile(this.walletFilePath(walletAddress), 'utf-8'),
			);

			return transactions;
		} else {
			throw this.errors.noTransactions(walletAddress);
		}
	}

	async getTransaction(walletAddress: string, transactionHash: string): Promise<Transaction> {
		if (!(await this.exists(walletAddress))) {
			throw this.errors.noTransactions(walletAddress);
		}

		const transactions = await this.getTransactions(walletAddress);
		const transaction = transactions.find((t) => t.hash === transactionHash);

		if (!transaction) {
			throw this.errors.transactionNotFound(transactionHash);
		}

		return transaction;
	}
}
