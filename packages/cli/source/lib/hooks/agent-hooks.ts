import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { call } from '../rpc/rpc.client.js';
import type { RpcMethods } from '../rpc/rpc.types.js';

type Args<M extends keyof RpcMethods> = RpcMethods[M]['args'];

export const useGetChats = () =>
	useQuery({
		queryKey: ['chats'],
		queryFn: () => call('agentGetChats', undefined),
	});

export const useGetChat = (chatId: string) =>
	useQuery({
		queryKey: ['chats', chatId],
		queryFn: () => call('agentGetChat', { chatId }),
	});

export const useProcessMessage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'agentProcessMessage'>) => call('agentProcessMessage', data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['chats'] });
			queryClient.invalidateQueries({ queryKey: ['chats', variables.chatId] });
		},
	});
};

export const useDecideToolCalls = () =>
	useMutation({
		mutationFn: (data: Args<'agentDecideToolCalls'>) => call('agentDecideToolCalls', data),
	});

export const useDeleteChat = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Args<'agentDeleteChat'>) => call('agentDeleteChat', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['chats'] });
		},
	});
};
