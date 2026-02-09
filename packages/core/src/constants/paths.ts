import * as os from 'os';
import * as path from 'path';

export const TRADESHELL_DIR = path.join(os.homedir(), '.tradeshell');
export const CONFIG_PATH = path.join(TRADESHELL_DIR, 'config.json');
export const WALLETS_FILE = path.join(TRADESHELL_DIR, 'wallets.json');
export const LOGS_FILE = path.join(TRADESHELL_DIR, 'debug.log');
export const hashRegex: RegExp = /^0x[0-9a-fA-F]{64}$/;
