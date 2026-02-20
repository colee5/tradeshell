import { z } from 'zod';

export enum AGENT_ROLES {
	USER = 'user',
	ASSISTANT = 'assistant',
}

export const chatIdSchema = z.object({ chatId: z.string().min(1) });

export const agentProcessMessageSchema = z.object({
	input: z.string().min(1),
	chatId: z.string().min(1),
});
