import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ChainId } from 'src/common/chains';

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

// Todo(cole): When supporting more than one chain at once,
// we'll hold a mapping of chainId -> RPC URL
export class BlockchainConfigDto {
	@Expose()
	@ApiProperty({
		description: 'Chain ID',
		enum: ChainId,
		example: ChainId.BASE,
	})
	@IsEnum(ChainId)
	chainId: ChainId;

	@ApiPropertyOptional({ description: 'RPC URL' })
	@IsOptional()
	@IsUrl({ protocols: ['http', 'https', 'wss', 'ws'] })
	@IsString()
	rpcUrl?: string;
}

export class ConfigDto {
	@ApiPropertyOptional({ type: LlmConfigDto, description: 'LLM configuration' })
	@IsOptional()
	@ValidateNested()
	@Type(() => LlmConfigDto)
	llm?: LlmConfigDto;

	@ApiPropertyOptional({ type: BlockchainConfigDto, description: 'Blockchain configuration' })
	@IsOptional()
	@ValidateNested()
	@Type(() => BlockchainConfigDto)
	blockchain?: BlockchainConfigDto;
}
