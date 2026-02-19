import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { call } from '../rpc/rpc.client.js';
import type { RpcMethods } from '../rpc/rpc.types.js';

type Args<M extends keyof RpcMethods> = RpcMethods[M]['args'];

export const useGetWalletStatus = () =>
	useQuery({
		queryKey: ['wallet', 'status'],
		queryFn: () => call('walletGetStatus', undefined),
	});

export const useGetWalletList = () =>
	useQuery({
		queryKey: ['wallet', 'list'],
		queryFn: () => call('walletList', undefined),
	});

export const useWalletSetup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'walletSetup'>) => call('walletSetup', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletUnlock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'walletUnlock'>) => call('walletUnlock', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
		},
	});
};

export const useWalletLock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => call('walletLock', undefined),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletAdd = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'walletAdd'>) => call('walletAdd', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletDelete = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'walletDelete'>) => call('walletDelete', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletSetActive = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'walletSetActive'>) => call('walletSetActive', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletCheckPassword = () =>
	useMutation({
		mutationFn: (data: Args<'walletCheckPassword'>) => call('walletCheckPassword', data),
	});

export const useWalletChangePassword = () =>
	useMutation({
		mutationFn: (data: Args<'walletChangePassword'>) => call('walletChangePassword', data),
	});
