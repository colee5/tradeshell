import { z } from 'zod';

export const chatIdSchema = z.object({ chatId: z.string().min(1) });

export const agentProcessMessageSchema = z.object({
	input: z.string().min(1),
	chatId: z.string().min(1),
});

export const agentDecideToolCallsSchema = z.object({
	chatId: z.string().min(1),
	decisions: z.array(
		z.object({
			approvalId: z.string().min(1),
			approved: z.boolean(),
		}),
	),
});

export enum ContentPartType {
	TOOL_APPROVAL_REQUEST = 'tool-approval-request',
	TOOL_APPROVAL_RESPONSE = 'tool-approval-response',
}

export enum AgentResponseType {
	TEXT = 'text',
	APPROVAL_REQUEST = 'approval-request',
}

export type AgentResponse =
	| { type: AgentResponseType.TEXT; text: string; toolsCalled: string[] }
	| {
			type: AgentResponseType.APPROVAL_REQUEST;
			approvals: Array<{
				approvalId: string;
				toolName: string;
				description: string;
				args: Record<string, unknown>;
			}>;
	  };
