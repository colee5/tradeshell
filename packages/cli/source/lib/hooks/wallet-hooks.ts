import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../rpc/rpc.client.js';

export const useGetWalletStatus = () =>
	useQuery({
		queryKey: ['wallet', 'status'],
		queryFn: () => trpc.walletGetStatus.query(),
	});

export const useGetWalletList = () =>
	useQuery({
		queryKey: ['wallet', 'list'],
		queryFn: () => trpc.walletList.query(),
	});

export const useWalletSetup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletSetup.mutate>[0]) =>
			trpc.walletSetup.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletUnlock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletUnlock.mutate>[0]) =>
			trpc.walletUnlock.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
		},
	});
};

export const useWalletLock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => trpc.walletLock.mutate(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletAdd = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletAdd.mutate>[0]) => trpc.walletAdd.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletDelete = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletDelete.mutate>[0]) =>
			trpc.walletDelete.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletSetActive = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletSetActive.mutate>[0]) =>
			trpc.walletSetActive.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wallet', 'list'] });
			queryClient.invalidateQueries({ queryKey: ['wallet', 'status'] });
		},
	});
};

export const useWalletCheckPassword = () =>
	useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletCheckPassword.mutate>[0]) =>
			trpc.walletCheckPassword.mutate(data),
	});

export const useWalletChangePassword = () =>
	useMutation({
		mutationFn: (data: Parameters<typeof trpc.walletChangePassword.mutate>[0]) =>
			trpc.walletChangePassword.mutate(data),
	});
