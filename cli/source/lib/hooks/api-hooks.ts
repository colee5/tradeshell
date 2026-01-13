import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	configControllerGetConfigOptions,
	configControllerPartialUpdateMutation,
	configControllerResetConfigMutation,
	configControllerUpdateConfigMutation,
} from '../generated/@tanstack/react-query.gen.js';

export const useGetConfig = () => useQuery(configControllerGetConfigOptions());

export const useUpdateConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...configControllerUpdateConfigMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: configControllerGetConfigOptions().queryKey });
		},
	});
};

export const usePartialUpdateConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...configControllerPartialUpdateMutation(),
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
