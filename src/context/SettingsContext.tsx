import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { settingsService } from '../services/settingsService';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
  savedToBackend: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const LANGUAGE_CODES: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Spanish: 'es',
  Kannada: 'kn',
};

const applyAppearance = (settings: AppSettings) => {
  const root = document.documentElement;
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark);

  root.classList.toggle('dark', isDark);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.style.colorScheme = isDark ? 'dark' : 'light';
  root.lang = LANGUAGE_CODES[settings.language] || 'en';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(() =>
    settingsService.getLocalSettings(user?.role)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [savedToBackend, setSavedToBackend] = useState(true);

  // Reload the user's preferences whenever the logged-in user changes.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void settingsService.loadSettings(user?.role).then(loaded => {
      if (!active) return;
      setSettings(loaded);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [user?.id, user?.role]);

  // Theme + language are global side effects, applied immediately on every change.
  useEffect(() => {
    applyAppearance(settings);
  }, [settings.theme, settings.language]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const handler = () => {
      if (settings.theme === 'system') applyAppearance(settings);
    };
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, [settings.theme, settings.language]);

  const commit = useCallback((next: AppSettings) => {
    setSettings(next);
    applyAppearance(next);
    void settingsService.saveSettings(next).then(setSavedToBackend);
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    commit({ ...settings, ...patch });
  }, [settings, commit]);

  const resetSettings = useCallback(() => {
    commit({ ...DEFAULT_SETTINGS });
  }, [commit]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, resetSettings, isLoading, savedToBackend }),
    [settings, updateSettings, resetSettings, isLoading, savedToBackend]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
};
