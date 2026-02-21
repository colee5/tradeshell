import { BlockchainService } from '../../blockchain.service.js';
import { getWalletBalanceTool } from './get-wallet-balance.js';
import { sendEtherTool } from './send-ether.js';

export function createTools(services: { blockchainService: BlockchainService }) {
	return {
		getWalletBalance: getWalletBalanceTool(services.blockchainService),
		sendEther: sendEtherTool(services.blockchainService),
	};
}
