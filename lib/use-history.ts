'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'tlusr.playground.history.v1';
const MAX_ENTRIES = 20;

export interface HistoryEntry {
  id: string;
  label: string;
  url: string;
  html: string;
  savedAt: number;
}

function read(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* quota — silently drop */
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(read());
  }, []);

  const push = useCallback((entry: Omit<HistoryEntry, 'id' | 'savedAt'>) => {
    setEntries((prev) => {
      const next: HistoryEntry[] = [
        { ...entry, id: crypto.randomUUID(), savedAt: Date.now() },
        ...prev.filter((e) => !(e.url === entry.url && e.html === entry.html)),
      ].slice(0, MAX_ENTRIES);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    write([]);
  }, []);

  return { entries, push, remove, clear };
}
