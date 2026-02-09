import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	configControllerGetChainsOptions,
	configControllerGetConfigOptions,
	configControllerResetConfigMutation,
	configControllerUpdateBlockchainConfigMutation,
	configControllerUpdateLlmConfigMutation,
	walletControllerAddWalletMutation,
	walletControllerChangePasswordMutation,
	walletControllerDeleteWalletMutation,
	walletControllerGetStatusOptions,
	walletControllerListWalletsOptions,
	walletControllerLockMutation,
	walletControllerSetActiveMutation,
	walletControllerSetupMutation,
	walletControllerUnlockMutation,
} from '../generated/@tanstack/react-query.gen.js';

// Config Hooks
export const useGetConfig = () => useQuery(configControllerGetConfigOptions());

export const useUpdateLlmConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...configControllerUpdateLlmConfigMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: configControllerGetConfigOptions().queryKey });
		},
	});
};

export const useUpdateBlockchainConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...configControllerUpdateBlockchainConfigMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: configControllerGetConfigOptions().queryKey });
		},
	});
};

export const useResetConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...configControllerResetConfigMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: configControllerGetConfigOptions().queryKey });
		},
	});
};

export const useGetChains = () => useQuery(configControllerGetChainsOptions());

// Wallet hooks
export const useGetWalletStatus = () => useQuery(walletControllerGetStatusOptions());

export const useGetWalletList = () => useQuery(walletControllerListWalletsOptions());

export const useWalletSetup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...walletControllerSetupMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: walletControllerGetStatusOptions().queryKey });
		},
	});
};

export const useWalletUnlock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...walletControllerUnlockMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: walletControllerGetStatusOptions().queryKey });
			queryClient.invalidateQueries({ queryKey: walletControllerListWalletsOptions().queryKey });
		},
	});
};

export const useWalletLock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...walletControllerLockMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: walletControllerGetStatusOptions().queryKey });
		},
	});
};

export const useWalletAdd = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...walletControllerAddWalletMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: walletControllerListWalletsOptions().queryKey });
			queryClient.invalidateQueries({ queryKey: walletControllerGetStatusOptions().queryKey });
		},
	});
};

export const useWalletDelete = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...walletControllerDeleteWalletMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: walletControllerListWalletsOptions().queryKey });
			queryClient.invalidateQueries({ queryKey: walletControllerGetStatusOptions().queryKey });
		},
	});
};

export const useWalletSetActive = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...walletControllerSetActiveMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: walletControllerListWalletsOptions().queryKey });
			queryClient.invalidateQueries({ queryKey: walletControllerGetStatusOptions().queryKey });
		},
	});
};

export const useWalletChangePassword = () => useMutation(walletControllerChangePasswordMutation());
