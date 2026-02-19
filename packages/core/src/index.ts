// Services
export { BlockchainService } from './services/blockchain.service.js';
export { ConfigService } from './services/config.service.js';
export { WalletService } from './services/wallet.service.js';

// Types
export { ChainId } from './constants/chains.js';
export type { SerializableChain } from './constants/chains.js';
export { privateKeyRegex } from './constants/index.js';
export { LLM_MODELS, LlmProvider, LlmType } from './constants/llm.js';
export { type BlockchainConfig, type Config, type LlmConfig } from './types/config.types.js';
export { type WalletInfo, type WalletStatus } from './types/wallet.types.js';

// Validation Schemas (used by worker-side RPC validation)
export { blockchainConfigSchema, llmConfigSchema } from './types/config.types.js';
export {
	addWalletInputSchema,
	walletAddressSchema,
	walletChangePasswordSchema,
	walletPasswordSchema,
} from './types/wallet.types.js';

// Form Schemas (used by client-side React Hook Form)
export {
	blockchainOnboardingSchema,
	configSchema,
	llmSelfHostedOnboardingSchema,
} from './types/config.types.js';
export { walletChangePasswordFormSchema, walletSetupSchema } from './types/wallet.types.js';

// Error Types
export { BadRequestError } from './services/errors.js';
