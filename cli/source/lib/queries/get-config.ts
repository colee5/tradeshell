import axios from 'axios';
import { API_URL } from '../constants.js';
import type { Config } from '../types/config.types.js';

export async function getConfig(): Promise<Config> {
	const response = await axios.get<Config>(`${API_URL}/config`);
	return response.data;
}
