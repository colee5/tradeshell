// Services
export { ConfigService } from './services/config.service.js';
export { WalletService } from './services/wallet.service.js';
export { BlockchainService } from './services/blockchain.service.js';

// Errors
export { CoreError, NotFoundError, UnauthorizedError, BadRequestError } from './services/errors.js';

// Logger
export { createLogger, type Logger } from './services/logger.js';

// Types (Zod schemas + inferred types)
export {
	configSchema,
	llmConfigSchema,
	blockchainConfigSchema,
	type Config,
	type LlmConfig,
	type BlockchainConfig,
} from './types/config.types.js';
export {
	walletInfoSchema,
	walletStatusSchema,
	addWalletInputSchema,
	type WalletInfo,
	type WalletStatus,
	type AddWalletInput,
} from './types/wallet.types.js';

// Constants
export { ChainId, CHAIN_BY_ID } from './constants/chains.js';
export type { Chain } from './constants/chains.js';
export {
	TRADESHELL_DIR,
	CONFIG_PATH,
	WALLETS_FILE,
	LOGS_FILE,
	hashRegex,
} from './constants/paths.js';
export { CONFIG_EVENTS, WALLET_EVENTS } from './constants/events.js';

// Utils
export {
	generateMasterKey,
	encryptMasterKey,
	decryptMasterKey,
	encryptPrivateKey,
	decryptPrivateKey,
	type EncryptedData,
	type MasterKeyData,
} from './utils/crypto.utils.js';
