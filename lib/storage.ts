import { StoredVote } from './types';
const VOTER_ID_KEY = 'daily-divide-voter-id';
const voteStorageKey = (questionId: string) => `daily-divide-vote:${questionId}`;
export function getVoterId(): string | null { if (typeof window === 'undefined') return null; const stored = window.localStorage.getItem(VOTER_ID_KEY); if (stored) return stored; const voterId = crypto.randomUUID(); window.localStorage.setItem(VOTER_ID_KEY, voterId); return voterId; }
export function getStoredVote(questionId: string): StoredVote | null { if (typeof window === 'undefined') return null; try { const value = window.localStorage.getItem(voteStorageKey(questionId)); return value ? JSON.parse(value) as StoredVote : null; } catch { return null; } }
export function storeVote(vote: StoredVote) { if (typeof window !== 'undefined') window.localStorage.setItem(voteStorageKey(vote.questionId), JSON.stringify(vote)); }
