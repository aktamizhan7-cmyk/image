import { useState, useCallback, useRef } from 'react';
import { ManualAdjustmentSettings, DEFAULT_MANUAL_SETTINGS } from '../types';

export function useAdjustmentHistory(initialState: ManualAdjustmentSettings = DEFAULT_MANUAL_SETTINGS) {
  const [history, setHistory] = useState<{
    past: ManualAdjustmentSettings[];
    present: ManualAdjustmentSettings;
    future: ManualAdjustmentSettings[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  const lastSavedRef = useRef<ManualAdjustmentSettings>(initialState);
  const debounceTimerRef = useRef<number | null>(null);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Real-time live update for slider movement without saving snapshot on every sub-pixel
  const updateLive = useCallback((newSettings: ManualAdjustmentSettings) => {
    setHistory((curr) => ({
      ...curr,
      present: newSettings,
    }));

    // Debounce pushing snapshot to past history
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setHistory((curr) => {
        if (JSON.stringify(lastSavedRef.current) === JSON.stringify(curr.present)) {
          return curr;
        }
        const newPast = [...curr.past, lastSavedRef.current];
        lastSavedRef.current = curr.present;
        return {
          past: newPast.slice(-30), // keep last 30 states
          present: curr.present,
          future: [],
        };
      });
    }, 400);
  }, []);

  // Explicit commit (e.g. on slider change end / mouse up)
  const commit = useCallback((newSettings: ManualAdjustmentSettings) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setHistory((curr) => {
      if (JSON.stringify(lastSavedRef.current) === JSON.stringify(newSettings)) {
        return curr;
      }
      const newPast = [...curr.past, lastSavedRef.current];
      lastSavedRef.current = newSettings;
      return {
        past: newPast.slice(-30),
        present: newSettings,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      lastSavedRef.current = previous;
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      lastSavedRef.current = next;
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setHistory((curr) => {
      const isAlreadyDefault = JSON.stringify(curr.present) === JSON.stringify(DEFAULT_MANUAL_SETTINGS);
      if (isAlreadyDefault) return curr;
      lastSavedRef.current = DEFAULT_MANUAL_SETTINGS;
      return {
        past: [...curr.past, curr.present],
        present: DEFAULT_MANUAL_SETTINGS,
        future: [],
      };
    });
  }, []);

  return {
    settings: history.present,
    updateLive,
    commit,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
