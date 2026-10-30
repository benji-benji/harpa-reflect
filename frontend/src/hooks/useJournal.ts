import { useState, useCallback } from 'react';
import type { JournalEntry, JournalEntryCreate, JournalEntryListItem } from '../types/api';
import * as api from '../services/api';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const data = await api.getEntries();
    setEntries(data);
    setIsLoading(false);
  }, []);

  const getEntry = useCallback(async (id: string) => {
    setIsLoading(true);
    const data = await api.getEntry(id);
    setEntry(data);
    setIsLoading(false);
    return data;
  }, []);

  const createEntry = useCallback(async (data: JournalEntryCreate) => {
    const created = await api.createEntry(data);
    setCurrentEntry(created);
    return created;
  }, []);

  const completeEntry = useCallback(async (id: string) => {
    const completed = await api.completeEntry(id);
    setCurrentEntry(completed);
    return completed;
  }, []);

  return { entries, entry, currentEntry, isLoading, fetchEntries, getEntry, createEntry, completeEntry };
}
