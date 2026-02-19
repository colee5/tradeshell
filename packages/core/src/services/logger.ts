import * as fs from 'fs';
import pino from 'pino';
import { LOGS_PATH, TRADESHELL_DIR } from '../constants/paths.js';

export type Logger = {
	log: (message: string) => void;
	error: (message: string, error?: unknown) => void;
	warn: (message: string) => void;
};

fs.mkdirSync(TRADESHELL_DIR, { recursive: true });

const ROTATION_SIZE = '5m'; // 5MB

const rootLogger = pino(
	{
		timestamp: pino.stdTimeFunctions.isoTime,
	},
	pino.transport({
		target: 'pino-roll',
		options: {
			file: LOGS_PATH,
			size: ROTATION_SIZE,
			mkdir: true,
		},
	}),
);

export function createLogger(context: string): Logger {
	const child = rootLogger.child({ context });

	return {
		log: (message: string) => {
			child.info(message);
		},
		error: (message: string, error?: unknown) => {
			if (error instanceof Error) {
				child.error({ err: error }, message);
			} else {
				child.error(message);
			}
		},
		warn: (message: string) => {
			child.warn(message);
		},
	};
}

// bun run logs
