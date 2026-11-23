import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/di/ServicesContext';

/** Chargement initial + routage des actions de notification (Ouvrir / Livré / Waze). */
export function useAppBootstrap() {
  const { parcelStore, settingsStore, notifications, navigation } = useServices();
  const navigate = useNavigate();

  useEffect(() => {
    void Promise.all([parcelStore.load(), settingsStore.load()]);
    void notifications.init(({ type, parcelId }) => {
      const parcel = parcelStore.byId(parcelId);
      if (!parcel) return;
      if (type === 'deliver') parcelStore.markDelivered(parcelId);
      else if (type === 'navigate') void navigation.navigateTo(parcel.address);
      else navigate(`/colis/${parcelId}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
