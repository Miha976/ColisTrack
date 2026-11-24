import { useServices } from '@/di/ServicesContext';
import { ARRIVAL_RADIUS } from '@/models/Settings';
import { useObservable } from './useObservable';

export const RADIUS_OPTIONS = [100, 200, 400, 800] as const;

export function useSettingsViewModel() {
  const { settingsStore, parcelStore, notifications } = useServices();
  const settings = useObservable(settingsStore);
  const { parcels } = useObservable(parcelStore);

  return {
    settings,
    arrivalRadius: ARRIVAL_RADIUS,
    setRadius: (alertRadius: number) => settingsStore.update({ alertRadius }),
    testAlerts: () => notifications.test(),
    deliveredCount: parcels.filter((p) => p.status === 'delivered').length,
    clearDelivered: () => parcelStore.clearDelivered(),
  };
}
