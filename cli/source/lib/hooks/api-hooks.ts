import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	configControllerGetChainsOptions,
	configControllerGetConfigOptions,
	configControllerResetConfigMutation,
	configControllerUpdateBlockchainConfigMutation,
	configControllerUpdateLlmConfigMutation,
} from '../generated/@tanstack/react-query.gen.js';

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
