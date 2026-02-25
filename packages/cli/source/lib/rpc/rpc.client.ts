import { createTRPCClient, unstable_localLink } from '@trpc/client';
import type { AppRouter } from '@tradeshell/core';
import { router } from './server.js';

// Uses localLink for direct in-process calls (single thread).

// If CPU-heavy work is added later, swap localLink for a custom Worker postMessage link
// to move execution to a separate thread — the router and hooks stay the same.
export const trpc = createTRPCClient<AppRouter>({
	links: [
		unstable_localLink({
			router,
			createContext: async () => ({}),
		}),
	],
});
