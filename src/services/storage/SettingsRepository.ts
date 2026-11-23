import { DEFAULT_SETTINGS, type Settings } from '@/models/Settings';
import type { KeyValueStorage } from './KeyValueStorage';

export class SettingsRepository {
  private static readonly KEY = 'settings.v1';

  constructor(private readonly storage: KeyValueStorage) {}

  async load(): Promise<Settings> {
    return { ...DEFAULT_SETTINGS, ...(await this.storage.get<Partial<Settings>>(SettingsRepository.KEY)) };
  }

  save(settings: Settings): Promise<void> {
    return this.storage.set(SettingsRepository.KEY, settings);
  }
}
