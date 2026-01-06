import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ConfigService } from './config.service';
import type { Config } from './config.schema';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getConfig(): Config {
    return this.configService.get();
  }

  @Put()
  async updateConfig(@Body() config: Config): Promise<Config> {
    await this.configService.save(config);
    return this.configService.get();
  }

  @Patch()
  async partialUpdate(@Body() updates: Partial<Config>): Promise<Config> {
    return this.configService.update(updates);
  }
}
