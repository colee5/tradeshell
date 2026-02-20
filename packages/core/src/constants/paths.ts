import * as os from 'os';
import * as path from 'path';

// ~/.tradeshell
export const TRADESHELL_DIR = path.join(os.homedir(), '.tradeshell');

// ~/.tradeshell/config.json
export const CONFIG_PATH = path.join(TRADESHELL_DIR, 'config.json');

// ~/.tradeshell/wallets.json
export const WALLETS_PATH = path.join(TRADESHELL_DIR, 'wallets.json');

// ~/.tradeshell/debug.log
export const LOGS_PATH = path.join(TRADESHELL_DIR, 'debug.log');

// ~/.tradeshell/chats/
export const CHATS_DIR = path.join(TRADESHELL_DIR, 'chats');
