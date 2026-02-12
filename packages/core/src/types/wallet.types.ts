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

export const walletPasswordSchema = z.object({
	password: z.string().min(1),
});

export const walletChangePasswordSchema = z.object({
	oldPassword: z.string().min(1),
	newPassword: z.string().min(1),
});

export const walletAddressSchema = z.object({
	address: z.string().min(1),
});

export type WalletInfo = z.infer<typeof walletInfoSchema>;
export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type AddWalletInput = z.infer<typeof addWalletInputSchema>;
