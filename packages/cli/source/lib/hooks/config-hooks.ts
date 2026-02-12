import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { call } from '../rpc/rpc.client.js';
import type { RpcMethods } from '../rpc/rpc.types.js';

type Args<M extends keyof RpcMethods> = RpcMethods[M]['args'];

export const useGetConfig = () =>
	useQuery({
		queryKey: ['config'],
		queryFn: () => call('getConfig', undefined),
	});

export const useUpdateLlmConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'updateLlmConfig'>) => call('updateLlmConfig', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['config'] });
		},
	});
};

export const useUpdateBlockchainConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'updateBlockchainConfig'>) => call('updateBlockchainConfig', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['config'] });
		},
	});
};

export const useResetConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => call('resetConfig', undefined),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['config'] });
		},
	});
};

export const useGetChains = () =>
	useQuery({
		queryKey: ['chains'],
		queryFn: () => call('getChains', undefined),
	});
