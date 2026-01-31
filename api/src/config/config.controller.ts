import { Body, Controller, Delete, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { BlockchainConfigDto, ConfigDto, LlmConfigDto } from './dto/config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
	constructor(private readonly configService: ConfigService) {}

	@Get()
	@ApiOperation({ summary: 'Get current configuration' })
	async getConfig(): Promise<ConfigDto> {
		return await this.configService.get();
	}

	@Put('llm')
	@ApiOperation({ summary: 'Update LLM configuration' })
	async updateLlmConfig(@Body() llm: LlmConfigDto): Promise<ConfigDto> {
		return this.configService.updateLlm(llm);
	}

	@Put('blockchain')
	@ApiOperation({ summary: 'Update blockchain configuration' })
	async updateBlockchainConfig(@Body() blockchain: BlockchainConfigDto): Promise<ConfigDto> {
		return this.configService.updateBlockchain(blockchain);
	}

	@Delete()
	@ApiOperation({ summary: 'Reset configuration to defaults' })
	async resetConfig(): Promise<ConfigDto> {
		await this.configService.save({});
		return this.configService.get();
	}
}
