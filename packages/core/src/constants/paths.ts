import * as os from 'os';
import * as path from 'path';

// ~/.tradeshell
export const TRADESHELL_DIR = path.join(os.homedir(), '.tradeshell');

// ~/.tradeshell/config.json
export const CONFIG_PATH = path.join(TRADESHELL_DIR, 'config.json');

// ~/.tradeshell/wallets.json
export const WALLETS_FILE = path.join(TRADESHELL_DIR, 'wallets.json');

// ~/.tradeshell/debug.log
export const LOGS_FILE = path.join(TRADESHELL_DIR, 'debug.log');

// CONSTANTS
export const hashRegex: RegExp = /^0x[0-9a-fA-F]{64}$/;
