import {
	addWalletInputSchema,
	BadRequestError,
	blockchainConfigSchema,
	llmConfigSchema,
	walletAddressSchema,
	walletChangePasswordSchema,
	walletPasswordSchema,
} from '@tradeshell/core';
import { z } from 'zod';
import type { RpcMethods } from './rpc.types.js';

// Map each RPC method to its Zod validation schema
// Methods without schemas are allowed to pass through unvalidated
export const rpcValidationSchemas: Partial<Record<keyof RpcMethods, z.ZodType>> = {
	// Config
	updateLlmConfig: llmConfigSchema,
	updateBlockchainConfig: blockchainConfigSchema,

	// Wallet
	walletSetup: walletPasswordSchema,
	walletUnlock: walletPasswordSchema,
	walletCheckPassword: walletPasswordSchema,
	walletChangePassword: walletChangePasswordSchema,
	walletAdd: addWalletInputSchema,
	walletSetActive: walletAddressSchema,
	walletDelete: walletAddressSchema,
};

// Validates RPC method arguments against their schema.
// Throws BadRequestError if validation fails.
export function validateRpcArgs<M extends keyof RpcMethods>(
	method: M,
	args: unknown,
): RpcMethods[M]['args'] {
	const schema = rpcValidationSchemas[method];

	// If no schema is defined, pass through
	if (!schema) {
		return args as RpcMethods[M]['args'];
	}

	const result = schema.safeParse(args);

	if (!result.success) {
		const errorMessages = result.error.issues.map((error) => {
			const fieldPath = error.path.join('.');

			return `${fieldPath}: ${error.message}`;
		});

		const message = errorMessages.join(', ');
		throw new BadRequestError(message);
	}

	return result.data as RpcMethods[M]['args'];
}
