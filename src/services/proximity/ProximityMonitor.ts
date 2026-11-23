import { Observable } from '@/core/Observable';
import { distanceMeters } from '@/core/geo';
import type { GeoPoint } from '@/models/Address';
import type { LocationTracker } from '@/services/location/LocationTracker';
import type { NotificationService } from '@/services/notification/NotificationService';
import type { ParcelStore } from '@/stores/ParcelStore';
import type { SettingsStore } from '@/stores/SettingsStore';

export interface ProximityState {
  tracking: boolean;
  position: GeoPoint | null;
  error: string | null;
}

/** Une fois sorti de ce multiple du rayon, le colis peut de nouveau déclencher une alerte. */
const REARM_FACTOR = 3;

/**
 * Patron Facade : orchestre GPS + colis + réglages + notifications
 * derrière une API minimale (start / stop) pour les ViewModels.
 */
export class ProximityMonitor extends Observable<ProximityState> {
  constructor(
    private readonly tracker: LocationTracker,
    private readonly notifier: NotificationService,
    private readonly parcels: ParcelStore,
    private readonly settings: SettingsStore,
  ) {
    super({ tracking: false, position: null, error: null });
  }

  async start(): Promise<void> {
    if (this.state.tracking) return;
    this.setState((s) => ({ ...s, tracking: true, error: null }));
    try {
      await this.tracker.start(this.onPosition, (e) => this.setState((s) => ({ ...s, error: e.message })));
    } catch (e) {
      this.setState((s) => ({ ...s, tracking: false, error: (e as Error).message }));
    }
  }

  async stop(): Promise<void> {
    await this.tracker.stop();
    this.setState((s) => ({ ...s, tracking: false }));
  }

  private onPosition = (position: GeoPoint): void => {
    this.setState((s) => ({ ...s, position, error: null }));
    const { alertRadius, largeOnly } = this.settings.getSnapshot();

    for (const parcel of this.parcels.pending()) {
      if (largeOnly && parcel.size !== 'large') continue;
      const d = distanceMeters(position, parcel.address);
      if (!parcel.notifiedAt && d <= alertRadius) {
        this.parcels.setNotified(parcel.id, Date.now());
        void this.notifier.notifyNear(parcel, d);
      } else if (parcel.notifiedAt && d > alertRadius * REARM_FACTOR) {
        this.parcels.setNotified(parcel.id, undefined);
      }
    }
  };
}
