import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { ConfigModule } from 'src/config/config.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
	imports: [ConfigModule, WalletModule],
	providers: [BlockchainService],
	exports: [BlockchainService],
})
export class BlockchainModule {}
