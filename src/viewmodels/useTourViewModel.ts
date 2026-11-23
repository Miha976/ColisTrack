import { useMemo, useState } from 'react';
import { useServices } from '@/di/ServicesContext';
import { distanceMeters } from '@/core/geo';
import type { Parcel } from '@/models/Parcel';
import { useObservable } from './useObservable';

export type TourTab = 'pending' | 'delivered';
export interface ParcelItem {
  parcel: Parcel;
  distance: number | null;
}

const SIZE_WEIGHT = { large: 0, medium: 1, small: 2 } as const;

export function useTourViewModel() {
  const { parcelStore, proximity, navigation } = useServices();
  const { parcels, loaded } = useObservable(parcelStore);
  const { tracking, position, error } = useObservable(proximity);
  const [tab, setTab] = useState<TourTab>('pending');

  const items = useMemo<ParcelItem[]>(() => {
    const list = parcels
      .filter((p) => p.status === tab)
      .map((parcel) => ({ parcel, distance: position ? distanceMeters(position, parcel.address) : null }));

    if (tab === 'delivered') return list.sort((a, b) => (b.parcel.deliveredAt ?? 0) - (a.parcel.deliveredAt ?? 0));
    // À livrer : le plus proche d'abord ; sans GPS, les gros colis d'abord
    return list.sort((a, b) =>
      a.distance != null && b.distance != null
        ? a.distance - b.distance
        : SIZE_WEIGHT[a.parcel.size] - SIZE_WEIGHT[b.parcel.size],
    );
  }, [parcels, tab, position]);

  const total = parcels.length;
  const delivered = parcels.filter((p) => p.status === 'delivered').length;
  const largeLeft = parcels.filter((p) => p.status === 'pending' && p.size === 'large').length;

  return {
    loaded,
    tab,
    setTab,
    items,
    progress: { total, delivered, remaining: total - delivered, largeLeft },
    tracking,
    trackingError: error,
    toggleTracking: () => (tracking ? proximity.stop() : proximity.start()),
    deliver: (id: string) => parcelStore.markDelivered(id),
    undo: (id: string) => parcelStore.undoDelivered(id),
    navigate: (p: Parcel) => navigation.navigateTo(p.address),
    clearDelivered: () => parcelStore.clearDelivered(),
  };
}
