import { tool } from 'ai';
import { z } from 'zod';

const schema = {
	description:
		'Execute a shell command locally and return its output. Use this to fetch on-chain data via curl, run scripts, or any other local command the user requests.',
	inputSchema: z.object({
		command: z.string().describe('The shell command to execute'),
	}),
	outputSchema: z.object({
		stdout: z.string().describe('Standard output from the command'),
		stderr: z.string().describe('Standard error from the command'),
		exitCode: z.number().describe('Exit code of the process'),
	}),
};

export function executeCommandTool() {
	return tool({
		...schema,
		needsApproval: true,
		execute: async ({ command }) => {
			const proc = Bun.spawn(['sh', '-c', command], {
				stdout: 'pipe',
				stderr: 'pipe',
			});

			const [stdout, stderr] = await Promise.all([
				new Response(proc.stdout).text(),
				new Response(proc.stderr).text(),
			]);

			const exitCode = await proc.exited;

			return { stdout, stderr, exitCode };
		},
	});
}
