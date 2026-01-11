import { useMutation, useQuery } from '@tanstack/react-query';
import {
	configControllerGetConfigOptions,
	configControllerPartialUpdateMutation,
	configControllerResetConfigMutation,
	configControllerUpdateConfigMutation,
} from '../generated/@tanstack/react-query.gen.js';

export const useGetConfig = () => useQuery(configControllerGetConfigOptions());

export const useUpdateConfig = () => useMutation(configControllerUpdateConfigMutation());

export const usePartialUpdateConfig = () => useMutation(configControllerPartialUpdateMutation());

export const useResetConfig = () => useMutation(configControllerResetConfigMutation());
