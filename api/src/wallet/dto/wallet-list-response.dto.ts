import { ApiProperty } from '@nestjs/swagger';
import { WalletInfoResponseDto } from './wallet-info-response.dto';

export class WalletListResponseDto {
	@ApiProperty({ type: [WalletInfoResponseDto] })
	wallets: WalletInfoResponseDto[];
}
