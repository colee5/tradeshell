import { BaseError } from 'viem';
import { SimulationType, type SimulationResult } from '../types/simulation.types.js';

export function extractSimulationError(error: unknown): SimulationResult {
	if (error instanceof BaseError) {
		return { type: SimulationType.ERROR, warning: error.shortMessage };
	}

	return {
		type: SimulationType.ERROR,
		warning: error instanceof Error ? error.message : 'Simulation failed',
	};
}
