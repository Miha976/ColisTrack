import { Preferences } from '@capacitor/preferences';

/** Abstraction du stockage clé/valeur (natif via Capacitor Preferences, localStorage sur le web). */
export interface KeyValueStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

export class PreferencesStorage implements KeyValueStorage {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  }
}
