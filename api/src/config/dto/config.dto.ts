import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LlmConfigDto {
  @ApiPropertyOptional({
    enum: ['cloud', 'self-hosted'],
    description: 'LLM provider type',
  })
  @IsOptional()
  @IsEnum(['cloud', 'self-hosted'])
  type?: 'cloud' | 'self-hosted';

  @ApiPropertyOptional({
    description: 'Cloud provider name (anthropic, openai, groq)',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Model name' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Base URL for self-hosted LLM' })
  @IsOptional()
  @IsString()
  baseURL?: string;

  @ApiPropertyOptional({ description: 'API key for authentication' })
  @IsOptional()
  @IsString()
  apiKey?: string;
}

export class ConfigDto {
  @ApiPropertyOptional({ type: LlmConfigDto, description: 'LLM configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LlmConfigDto)
  llm?: LlmConfigDto;
}
