import { BlockchainService } from '../../blockchain.service.js';
import { ConfigService } from '../../config.service.js';
import { WalletService } from '../../wallet.service.js';
import { batchSendEtherTool } from './batch-send-ether.js';
import { bridgeEtherTool } from './bridge-ether.js';
import { executeCommandTool } from './execute-command.js';
import { getActiveWalletTool } from './get-active-wallet.js';
import { getSupportedChainsTool } from './get-supported-chains.js';
import { getWalletBalanceTool } from './get-wallet-balance.js';
import { sendEtherTool } from './send-ether.js';

export function createTools(services: {
	blockchainService: BlockchainService;
	configService: ConfigService;
	walletService: WalletService;
}) {
	return {
		getActiveWallet: getActiveWalletTool(services.walletService),
		getWalletBalance: getWalletBalanceTool(services.blockchainService),
		getSupportedChains: getSupportedChainsTool(services.configService),
		sendEther: sendEtherTool(services.blockchainService),
		batchSendEther: batchSendEtherTool(services.blockchainService),
		bridgeEther: bridgeEtherTool(services.blockchainService),
		executeCommand: executeCommandTool(),
	};
}
