import { atom } from 'jotai';
import React from 'react';

export type CommandLogEntry = {
	input: string;
	output: React.ReactElement;
};

export const commandLogAtom = atom<CommandLogEntry[]>([]);

export const pushCommandLogAtom = atom(null, (get, set, entry: CommandLogEntry) => {
	const current = get(commandLogAtom);

	set(commandLogAtom, [...current, entry]);
});
