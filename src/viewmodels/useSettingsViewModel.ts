import { useServices } from '@/di/ServicesContext';
import { useObservable } from './useObservable';

export const RADIUS_OPTIONS = [100, 200, 400, 800] as const;

export function useSettingsViewModel() {
  const { settingsStore, parcelStore } = useServices();
  const settings = useObservable(settingsStore);
  const { parcels } = useObservable(parcelStore);

  return {
    settings,
    setRadius: (alertRadius: number) => settingsStore.update({ alertRadius }),
    setLargeOnly: (largeOnly: boolean) => settingsStore.update({ largeOnly }),
    deliveredCount: parcels.filter((p) => p.status === 'delivered').length,
    clearDelivered: () => parcelStore.clearDelivered(),
  };
}
