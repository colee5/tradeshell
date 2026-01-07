import axios from 'axios';
import { API_URL } from '../constants.js';
import type { Config } from '../types/config.types.js';

export async function updateConfig(config: Config): Promise<Config> {
	const response = await axios.put<Config>(`${API_URL}/config`, config);
	return response.data;
}

export async function patchConfig(updates: Partial<Config>): Promise<Config> {
	const response = await axios.patch<Config>(`${API_URL}/config`, updates);
	return response.data;
}
