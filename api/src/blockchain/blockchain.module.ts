import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
	imports: [ConfigModule],
	providers: [BlockchainService],
	exports: [BlockchainService],
})
export class BlockchainModule {}
