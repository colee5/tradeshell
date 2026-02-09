import { z } from 'zod';

export const walletInfoSchema = z.object({
	address: z.string(),
	name: z.string(),
	isActive: z.boolean(),
});

export const walletStatusSchema = z.object({
	isSetup: z.boolean(),
	isUnlocked: z.boolean(),
	activeAddress: z.string().nullable(),
	activeName: z.string().nullable(),
	walletCount: z.number(),
});

export const addWalletInputSchema = z.object({
	privateKey: z.string(),
	name: z.string(),
	setActive: z.boolean().default(true),
});

export type WalletInfo = z.infer<typeof walletInfoSchema>;
export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type AddWalletInput = z.infer<typeof addWalletInputSchema>;
