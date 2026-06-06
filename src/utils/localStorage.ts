import type { HistoryEntry } from '../types';

const HISTORY_KEY = 'skillmatch_history';
const MAX_HISTORY = 3;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  try {
    const history = getHistory();
    const updated = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // storage quota exceeded or unavailable
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
