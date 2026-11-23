import { Geolocation } from '@capacitor/geolocation';
import type { LocationTracker } from './LocationTracker';

/** Repli navigateur / développement : suivi au premier plan uniquement. */
export class ForegroundLocationTracker implements LocationTracker {
  private watchId: string | null = null;

  async start(...[onPosition, onError]: Parameters<LocationTracker['start']>): Promise<void> {
    if (this.watchId) return;
    this.watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
      if (err) return onError(new Error(err.message ?? 'Position indisponible'));
      if (pos) onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  async stop(): Promise<void> {
    if (!this.watchId) return;
    await Geolocation.clearWatch({ id: this.watchId });
    this.watchId = null;
  }
}
