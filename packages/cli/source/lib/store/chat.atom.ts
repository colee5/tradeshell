import { atom } from 'jotai';

// Holds the active chat ID. A new UUID is generated per session,
// so all messages within a single CLI session belong to the same chat.
export const chatIdAtom = atom<string>(crypto.randomUUID());
