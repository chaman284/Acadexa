import api from '../lib/apiClient';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'acadexa_settings_v1';

const LEGACY_KEYS: Record<string, string> = {
  admin: 'acadexa_admin_settings',
  faculty: 'acadexa_faculty_settings_v1',
  student: 'acadexa_student_settings_v2',
};

const EXPORT_FORMATS = ['csv', 'json'];
const THEMES = ['light', 'dark', 'system'];

const coerce = (value: Record<string, any>): Partial<AppSettings> => {
  const clean: Record<string, any> = {};
  for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
    const incoming = value[key];
    if (incoming === undefined || incoming === null) continue;

    if (typeof fallback === 'boolean') {
      if (typeof incoming === 'boolean') clean[key] = incoming;
    } else if (key === 'theme') {
      if (THEMES.includes(incoming)) clean[key] = incoming;
    } else if (key === 'exportFormat' || key === 'autoExportFormat') {
      // Older faculty settings offered xlsx/pdf; map them to the supported formats.
      if (EXPORT_FORMATS.includes(incoming)) clean[key] = incoming;
      else if (incoming === 'xlsx' || incoming === 'pdf') clean[key] = 'csv';
    } else if (typeof incoming === 'string' && incoming.length <= 100) {
      clean[key] = incoming;
    }
  }
  return clean as Partial<AppSettings>;
};

const readJson = (key: string): Record<string, any> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed writing ${key}:`, e);
  }
};

export const settingsService = {
  /** Synchronous local read — safe to call from non-React helpers. */
  getLocalSettings(role?: string): AppSettings {
    const legacy = role && LEGACY_KEYS[role] ? readJson(LEGACY_KEYS[role]) : {};
    return {
      ...DEFAULT_SETTINGS,
      ...coerce(legacy),
      ...coerce(readJson(SETTINGS_STORAGE_KEY)),
    };
  },

  /** Load from the backend first so preferences follow the user across devices. */
  async loadSettings(role?: string): Promise<AppSettings> {
    const local = settingsService.getLocalSettings(role);
    try {
      const res = await api.get<{ settings?: Record<string, any> }>('/settings');
      const merged = { ...local, ...coerce(res.data?.settings || {}) };
      writeJson(SETTINGS_STORAGE_KEY, merged);
      return merged;
    } catch {
      return local;
    }
  },

  /** Persist everywhere: backend (source of truth) + local/legacy caches. */
  async saveSettings(settings: AppSettings): Promise<boolean> {
    writeJson(SETTINGS_STORAGE_KEY, settings);
    writeJson(LEGACY_KEYS.admin, settings);
    writeJson(LEGACY_KEYS.faculty, settings);
    writeJson(LEGACY_KEYS.student, settings);

    try {
      await api.put('/settings', { settings });
      return true;
    } catch (error) {
      console.warn('Backend settings save failed; kept locally:', error);
      return false;
    }
  },
};
