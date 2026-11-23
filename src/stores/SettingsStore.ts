import { Observable } from '@/core/Observable';
import { DEFAULT_SETTINGS, type Settings } from '@/models/Settings';
import type { SettingsRepository } from '@/services/storage/SettingsRepository';

export class SettingsStore extends Observable<Settings> {
  constructor(private readonly repo: SettingsRepository) {
    super(DEFAULT_SETTINGS);
  }

  async load(): Promise<void> {
    this.setState(await this.repo.load());
  }

  update(patch: Partial<Settings>): void {
    this.setState((s) => ({ ...s, ...patch }));
    void this.repo.save(this.state);
  }
}
