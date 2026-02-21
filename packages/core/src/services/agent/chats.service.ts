import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MAX_CHATS } from '../../constants/agent.js';
import { CHATS_DIR } from '../../constants/paths.js';
import { AGENT_ROLES } from '../../types/agent.types.js';
import { NotFoundError } from '../errors.js';
import { createLogger } from '../logger.js';

export type Message = {
	role: AGENT_ROLES;
	content: string;
};

export type Chat = {
	id: string;
	name: string;
	createdAt: number;
	messages: Message[];
};

// Each chat is a single JSON file: ~/.tradeshell/chats/{id}.json
// Rotation deletes the oldest files when count exceeds MAX_CHATS.
export class ChatsService {
	private readonly logger = createLogger(ChatsService.name);

	private readonly errors = {
		chatNotFound: (chatId: string) => new NotFoundError(`Chat not found: ${chatId}`),
	};

	async init(): Promise<void> {
		await fs.mkdir(CHATS_DIR, { recursive: true });
	}

	private chatPath(chatId: string): string {
		return path.join(CHATS_DIR, `${chatId}.json`);
	}

	async createChat(name: string, id?: string): Promise<Chat> {
		const chat: Chat = {
			id: id ?? crypto.randomUUID(),
			name,
			createdAt: Date.now(),
			messages: [],
		};

		await fs.writeFile(this.chatPath(chat.id), JSON.stringify(chat, null, 2), 'utf-8');
		await this.rotate();

		this.logger.log(`Created chat: ${chat.id}`);
		return chat;
	}

	async getChat(chatId: string): Promise<Chat | undefined> {
		try {
			const data = await fs.readFile(this.chatPath(chatId), 'utf-8');
			return JSON.parse(data);
		} catch {
			return undefined;
		}
	}

	async getChats(): Promise<Chat[]> {
		const files = await fs.readdir(CHATS_DIR);
		const chats = await Promise.all(
			files
				.filter((f) => f.endsWith('.json'))
				.map(async (f) => {
					const data = await fs.readFile(path.join(CHATS_DIR, f), 'utf-8');
					return JSON.parse(data) as Chat;
				}),
		);

		return chats.sort((a, b) => b.createdAt - a.createdAt);
	}

	async addMessage(chatId: string, role: AGENT_ROLES, content: string): Promise<void> {
		const chat = await this.getChat(chatId);

		if (!chat) {
			throw this.errors.chatNotFound(chatId);
		}

		chat.messages.push({ role, content });
		await fs.writeFile(this.chatPath(chatId), JSON.stringify(chat, null, 2), 'utf-8');
	}

	async deleteChat(chatId: string): Promise<void> {
		try {
			await fs.unlink(this.chatPath(chatId));
			this.logger.log(`Deleted chat: ${chatId}`);
		} catch {
			throw this.errors.chatNotFound(chatId);
		}
	}

	private async rotate(): Promise<void> {
		const chats = await this.getChats();

		if (chats.length <= MAX_CHATS) {
			return;
		}

		const toRemove = chats.slice(MAX_CHATS);

		await Promise.all(
			toRemove.map(async (chat) => {
				await fs.unlink(this.chatPath(chat.id));
				this.logger.log(`Rotated out chat: ${chat.id}`);
			}),
		);
	}
}
