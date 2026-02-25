import { initTRPC } from '@trpc/server';

const t = initTRPC.create({
	allowOutsideOfServer: true,
});

export const router = t.router;
export const procedure = t.procedure;
