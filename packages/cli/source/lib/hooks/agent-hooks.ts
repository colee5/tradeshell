import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../rpc/rpc.client.js';

export const useProcessMessage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof trpc.agentProcessMessage.mutate>[0]) =>
			trpc.agentProcessMessage.mutate(data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['chats'] });
			queryClient.invalidateQueries({ queryKey: ['chats', variables.chatId] });
		},
	});
};

export const useDecideToolCalls = () =>
	useMutation({
		mutationFn: (data: Parameters<typeof trpc.agentDecideToolCalls.mutate>[0]) =>
			trpc.agentDecideToolCalls.mutate(data),
	});
