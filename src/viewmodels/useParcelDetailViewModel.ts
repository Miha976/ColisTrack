import { useServices } from '@/di/ServicesContext';
import { distanceMeters } from '@/core/geo';
import { useObservable } from './useObservable';

export function useParcelDetailViewModel(id: string) {
  const { parcelStore, proximity, navigation } = useServices();
  useObservable(parcelStore); // ré-rendu à chaque changement
  const { position } = useObservable(proximity);
  const parcel = parcelStore.byId(id);

  return {
    parcel,
    distance: parcel && position ? distanceMeters(position, parcel.address) : null,
    deliver: () => parcelStore.markDelivered(id),
    undo: () => parcelStore.undoDelivered(id),
    navigate: () => parcel && navigation.navigateTo(parcel.address),
    remove: () => parcelStore.remove(id),
  };
}
