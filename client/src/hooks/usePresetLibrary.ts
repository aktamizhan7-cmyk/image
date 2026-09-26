import { useState, useCallback, useEffect } from 'react';
import {
  AdjustmentPreset,
  ManualAdjustmentSettings,
  EnhancementOptions,
  DEFAULT_MANUAL_SETTINGS,
} from '../types';
import { PresetLibraryService, BUILT_IN_PRESETS } from '../services/presetLibrary';

export function usePresetLibrary(
  onApplyManualSettings?: (settings: ManualAdjustmentSettings) => void,
  onApplyEnhancementOptions?: (options: EnhancementOptions) => void
) {
  const [userPresets, setUserPresets] = useState<AdjustmentPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Load user presets from localStorage
  const refreshPresets = useCallback(() => {
    const list = PresetLibraryService.getUserPresets();
    setUserPresets(list);
  }, []);

  useEffect(() => {
    refreshPresets();
  }, [refreshPresets]);

  // Combined presets: custom user presets first, then built-in curated presets
  const allPresets = [...userPresets, ...BUILT_IN_PRESETS];

  // Apply a preset configuration
  const applyPreset = useCallback(
    (preset: AdjustmentPreset, currentManual?: ManualAdjustmentSettings, currentAi?: EnhancementOptions) => {
      setActivePresetId(preset.id);

      if (onApplyManualSettings && preset.manualSettings) {
        // Merge with existing or default
        const base = currentManual ? { ...currentManual } : { ...DEFAULT_MANUAL_SETTINGS };
        const updatedManual: ManualAdjustmentSettings = {
          ...base,
          ...preset.manualSettings,
        };
        onApplyManualSettings(updatedManual);
      }

      if (onApplyEnhancementOptions && preset.enhancementOptions && currentAi) {
        const updatedAi: EnhancementOptions = {
          ...currentAi,
          ...preset.enhancementOptions,
        };
        onApplyEnhancementOptions(updatedAi);
      }
    },
    [onApplyManualSettings, onApplyEnhancementOptions]
  );

  // Save current studio settings as a new custom preset
  const saveCurrentSettingsAsPreset = useCallback(
    (
      name: string,
      description: string,
      category: AdjustmentPreset['category'],
      manualSettings: Partial<ManualAdjustmentSettings>,
      enhancementOptions?: Partial<EnhancementOptions>,
      existingId?: string,
      tags?: string[]
    ): AdjustmentPreset => {
      const saved = PresetLibraryService.savePreset(
        name,
        description,
        category,
        manualSettings,
        enhancementOptions,
        existingId,
        tags
      );
      refreshPresets();
      setActivePresetId(saved.id);
      return saved;
    },
    [refreshPresets]
  );

  // Delete a user preset
  const deletePreset = useCallback(
    (id: string) => {
      const success = PresetLibraryService.deletePreset(id);
      if (success) {
        refreshPresets();
        if (activePresetId === id) {
          setActivePresetId(null);
        }
      }
      return success;
    },
    [refreshPresets, activePresetId]
  );

  // Duplicate a preset
  const duplicatePreset = useCallback(
    (id: string) => {
      const copy = PresetLibraryService.duplicatePreset(id);
      if (copy) {
        refreshPresets();
        setActivePresetId(copy.id);
      }
      return copy;
    },
    [refreshPresets]
  );

  // Export presets to JSON file
  const exportPresets = useCallback((presetsToExport?: AdjustmentPreset[]) => {
    PresetLibraryService.exportPresetsToJson(presetsToExport);
  }, []);

  // Import presets from a File
  const importPresetsFromFile = useCallback(
    async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
      try {
        const text = await file.text();
        const result = PresetLibraryService.importPresetsFromJson(text);
        if (result.importedCount > 0) {
          refreshPresets();
          return { success: true, count: result.importedCount };
        }
        return { success: false, count: 0, error: result.errors || 'No valid presets found' };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message || 'Failed to read file' };
      }
    },
    [refreshPresets]
  );

  return {
    allPresets,
    userPresets,
    builtInPresets: BUILT_IN_PRESETS,
    activePresetId,
    setActivePresetId,
    applyPreset,
    saveCurrentSettingsAsPreset,
    deletePreset,
    duplicatePreset,
    exportPresets,
    importPresetsFromFile,
    refreshPresets,
  };
}
