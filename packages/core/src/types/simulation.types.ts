export enum SimulationType {
	GAS = 'gas',
	BATCH_GAS = 'batch-gas',
	BRIDGE = 'bridge',
	ERROR = 'error',
}

type GasEstimate = {
	type: SimulationType.GAS;
	gasEstimate: string;
	gasPrice: string;
	estimatedCost: string;
};

type BatchGasEstimate = {
	type: SimulationType.BATCH_GAS;
	recipients: string;
	gasPrice: string;
	estimatedTotalCost: string;
};

type BridgeEstimate = {
	type: SimulationType.BRIDGE;
	gasEstimate: string;
	gasPrice: string;
	estimatedGasCost: string;
};

type SimulationError = {
	type: SimulationType.ERROR;
	warning: string;
};

export type SimulationResult = GasEstimate | BatchGasEstimate | BridgeEstimate | SimulationError;
