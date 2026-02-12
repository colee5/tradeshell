import { z } from 'zod';
import { isAddress } from 'viem/utils';
import { privateKeyRegex } from '../constants/index.js';
import { MINIMUM_PASSWORD_CHARACTERS } from './type.constants.js';

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
	privateKey: z
		.string()
		.regex(
			privateKeyRegex,
			'Private key must be a valid 32-byte hex string (with or without 0x prefix)',
		),
	name: z.string().min(1, 'Name is required'),
	setActive: z.boolean().default(true),
});

export const walletPasswordSchema = z.object({
<<<<<<< HEAD
	password: z.string().min(MINIMUM_PASSWORD_CHARACTERS, 'Password must be at least 4 characters'),
});

export const walletChangePasswordSchema = z.object({
	oldPassword: z
		.string()
		.min(MINIMUM_PASSWORD_CHARACTERS, 'Password must be at least 4 characters'),
	newPassword: z
		.string()
		.min(MINIMUM_PASSWORD_CHARACTERS, 'Password must be at least 4 characters'),
});

export const walletAddressSchema = z.object({
	address: z.string().refine(isAddress, 'Invalid Ethereum address'),
});

// Client side schemas
export const walletChangePasswordFormSchema = walletChangePasswordSchema
	.extend({
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const walletSetupSchema = walletPasswordSchema
	.extend({
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

=======
	password: z.string().min(1),
});

export const walletChangePasswordSchema = z.object({
	oldPassword: z.string().min(1),
	newPassword: z.string().min(1),
});

export const walletAddressSchema = z.object({
	address: z.string().min(1),
});

>>>>>>> 60e7e0d (feat: add more wallet types)
export type WalletInfo = z.infer<typeof walletInfoSchema>;
export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type AddWalletInput = z.infer<typeof addWalletInputSchema>;
