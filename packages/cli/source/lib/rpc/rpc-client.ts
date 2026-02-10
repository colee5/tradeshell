import type { RpcMethods, RpcResponse } from './rpc.types.js';

const worker = new Worker(new URL('./worker.ts', import.meta.url));

let nextId = 0;

// Sends typed postMessage calls and resolves promises when the worker responds,
// matching responses to pending calls by auto-incrementing id.

const pending = new Map<
	number,
	{ resolve: (value: unknown) => void; reject: (error: Error) => void }
>();

worker.addEventListener('message', (event: MessageEvent<RpcResponse>) => {
	const { id, result, error } = event.data;
	const promise = pending.get(id);

	if (!promise) return;

	if (error) {
		const err = new Error(error.message);
		err.name = error.code;
		promise.reject(err);
	} else {
		promise.resolve(result);
	}

	pending.delete(id);
});

export function call<M extends keyof RpcMethods>(
	method: M,
	args: RpcMethods[M]['args'],
): Promise<RpcMethods[M]['return']> {
	const id = nextId++;
	worker.postMessage({ id, method, args });

	return new Promise((resolve, reject) => {
		pending.set(id, {
			resolve: resolve as (value: unknown) => void,
			reject,
		});
	});
}
