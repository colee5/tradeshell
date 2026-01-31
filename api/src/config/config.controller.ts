import { Body, Controller, Delete, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ConfigDto } from './dto/config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
	constructor(private readonly configService: ConfigService) {}

	@Get()
	@ApiOperation({ summary: 'Get current configuration' })
	async getConfig(): Promise<ConfigDto> {
		return await this.configService.get();
	}

	@Put()
	@ApiOperation({ summary: 'Update entire configuration' })
	async updateConfig(@Body() config: ConfigDto): Promise<ConfigDto> {
		await this.configService.save(config);
		return this.configService.get();
	}

	@Delete()
	@ApiOperation({ summary: 'Reset configuration to defaults' })
	async resetConfig(): Promise<ConfigDto> {
		await this.configService.save({});
		return this.configService.get();
	}
}
