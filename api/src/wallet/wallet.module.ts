import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { ConfigModule } from 'src/config/config.module';

@Module({
	imports: [ConfigModule],
	providers: [WalletService],
	controllers: [WalletController],
	exports: [WalletService],
})
export class WalletModule {}
