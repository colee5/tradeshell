import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../rpc/rpc.client.js';

export const useGetConfig = () =>
	useQuery({
		queryKey: ['config'],
		queryFn: () => trpc.getConfig.query(),
	});

export const useUpdateLlmConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.updateLlmConfig.mutate>[0]) =>
			trpc.updateLlmConfig.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['config'] });
		},
	});
};

export const useUpdateBlockchainConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.updateBlockchainConfig.mutate>[0]) =>
			trpc.updateBlockchainConfig.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['config'] });
		},
	});
};

export const useResetConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => trpc.resetConfig.mutate(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['config'] });
		},
	});
};

export const useGetChains = () =>
	useQuery({
		queryKey: ['chains'],
		queryFn: () => trpc.getChains.query(),
	});
