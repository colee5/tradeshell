import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ConfigDto } from './dto/config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get current configuration' })
  @ApiResponse({
    type: ConfigDto,
  })
  async getConfig(): Promise<ConfigDto> {
    return await this.configService.get();
  }

  @Put()
  @ApiOperation({ summary: 'Update entire configuration' })
  @ApiResponse({
    type: ConfigDto,
  })
  async updateConfig(@Body() config: ConfigDto): Promise<ConfigDto> {
    await this.configService.save(config);
    return this.configService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Partially update configuration' })
  @ApiResponse({
    type: ConfigDto,
  })
  async partialUpdate(@Body() updates: Partial<ConfigDto>): Promise<ConfigDto> {
    return this.configService.update(updates);
  }
}
