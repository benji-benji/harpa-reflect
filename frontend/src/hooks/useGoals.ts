import { useState, useCallback } from 'react';
import type { Goal } from '../types/api';
import * as api from '../services/api';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  const fetchActiveGoal = useCallback(async () => {
    const goal = await api.getActiveGoal();
    setActiveGoal(goal);
  }, []);

  const fetchGoals = useCallback(async () => {
    const data = await api.getGoals();
    setGoals(data);
  }, []);

  const createGoal = useCallback(async (text: string) => {
    const goal = await api.createGoal(text);
    setActiveGoal(goal);
    return goal;
  }, []);

  return { goals, activeGoal, fetchGoals, fetchActiveGoal, createGoal };
}
