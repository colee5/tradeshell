import { atom } from 'jotai';
import React from 'react';

// Command log entries start as live React components (loading state, spinner) and get
// replaced with static snapshots once data resolves. This ensures history
// entries don't re-render when underlying query data changes.

export type CommandLogEntry = {
	id: string;
	input: string;
	output: React.ReactElement;
};

export const commandLogAtom = atom<CommandLogEntry[]>([]);

// Push a new entry. If no id is provided, one is auto-generated.
// For async commands, we pass an explicit id so the entry can be replaced later.
export const pushCommandLogAtom = atom(
	null,
	(get, set, entry: Omit<CommandLogEntry, 'id'> & { id?: string }) => {
		const current = get(commandLogAtom);

		set(commandLogAtom, [...current, { ...entry, id: entry.id ?? crypto.randomUUID() }]);
	},
);

// Swap a live entry's output with a static snapshot by id.
export const replaceCommandLogEntryAtom = atom(
	null,
	(get, set, { id, output }: { id: string; output: React.ReactElement }) => {
		const current = get(commandLogAtom);

		set(
			commandLogAtom,
			current.map((entry) => (entry.id === id ? { ...entry, output } : entry)),
		);
	},
);
