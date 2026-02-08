import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
	imports: [EventEmitterModule.forRoot(), ConfigModule, BlockchainModule, WalletModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
