import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddWalletBodyDto } from './dto/add-wallet-body.dto';
import { ChangePasswordBodyDto } from './dto/change-password-body.dto';
import { DeleteWalletDto } from './dto/delete-wallet.dto';
import { SetActiveWalletDto } from './dto/set-active-wallet.dto';
import { SetupPasswordBodyDto } from './dto/setup-password-body.dto';
import { UnlockBodyDto } from './dto/unlock-body.dto';
import { WalletListResponseDto } from './dto/wallet-list-response.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { WalletStatusResponseDto } from './dto/wallet-status-response.dto';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
	constructor(private readonly walletService: WalletService) {}

	@Post('setup')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Set up the master password (first time only)' })
	async setup(@Body() { password }: SetupPasswordBodyDto) {
		await this.walletService.setup(password);
	}

	@Post('unlock')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Unlock all wallets with master password' })
	async unlock(@Body() { password }: UnlockBodyDto) {
		await this.walletService.unlock(password);
	}

	@Post('lock')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Lock all wallets' })
	lock() {
		this.walletService.lock();
	}

	@Put('password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Change the master password' })
	async changePassword(@Body() { oldPassword, newPassword }: ChangePasswordBodyDto) {
		await this.walletService.changePassword(oldPassword, newPassword);
	}

	@Post('add')
	@ApiOperation({ summary: 'Add a new wallet (requires unlocked state)' })
	async addWallet(
		@Body() { privateKey, name, setActive }: AddWalletBodyDto,
	): Promise<WalletResponseDto> {
		const address = await this.walletService.addWallet(privateKey, name, setActive ?? true);
		return { address };
	}

	@Get('list')
	@ApiOperation({ summary: 'List all wallets' })
	listWallets(): WalletListResponseDto {
		const wallets = this.walletService.getWallets();
		return { wallets };
	}

	@Get('status')
	@ApiOperation({ summary: 'Get wallet system status' })
	getStatus(): WalletStatusResponseDto {
		const activeWallet = this.walletService.getActiveAccountInfo();
		return {
			isSetup: this.walletService.isSetup(),
			isUnlocked: this.walletService.isUnlocked(),
			activeAddress: activeWallet?.address || null,
			activeName: activeWallet?.name || null,
			walletCount: this.walletService.getWalletCount(),
		};
	}

	@Put('active')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Set a wallet as active' })
	async setActive(@Body() { address }: SetActiveWalletDto) {
		await this.walletService.setActiveWallet(address);
	}

	@Delete('delete')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete a wallet' })
	async deleteWallet(@Body() { address }: DeleteWalletDto) {
		await this.walletService.deleteWallet(address);
	}
}
