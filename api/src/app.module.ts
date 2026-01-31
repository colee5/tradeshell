import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
	imports: [ConfigModule, BlockchainModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
