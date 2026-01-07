import { useQuery } from '@tanstack/react-query';
import type { Config } from '../types/config.types.js';
import { getConfig } from '../queries/get-config.js';

export function useGetConfig() {
	return useQuery<Config>({
		queryKey: ['config'],
		queryFn: getConfig,
	});
}
