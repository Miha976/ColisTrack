import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import type { LocationTracker } from './LocationTracker';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

/** Suivi GPS qui continue quand l'appli est en arrière-plan (ex. pendant Waze), via un service de premier plan Android. */
export class BackgroundLocationTracker implements LocationTracker {
  private watcherId: string | null = null;

  async start(...[onPosition, onError]: Parameters<LocationTracker['start']>): Promise<void> {
    if (this.watcherId) return;
    this.watcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundTitle: 'Tournée en cours',
        backgroundMessage: 'ColiTrack vous prévient à l’approche de vos livraisons.',
        requestPermissions: true,
        stale: false,
        distanceFilter: 10 // précision suffisante pour l'alerte à 50 m,
      },
      (location, error) => {
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') BackgroundGeolocation.openSettings();
          onError(new Error(error.message));
          return;
        }
        if (location) onPosition({ lat: location.latitude, lng: location.longitude });
      },
    );
  }

  async stop(): Promise<void> {
    if (!this.watcherId) return;
    await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
    this.watcherId = null;
  }
}
