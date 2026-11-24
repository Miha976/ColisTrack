import { Observable } from '@/core/Observable';
import { distanceMeters } from '@/core/geo';
import type { GeoPoint } from '@/models/Address';
import { ARRIVAL_RADIUS } from '@/models/Settings';
import type { LocationTracker } from '@/services/location/LocationTracker';
import type { NotificationService } from '@/services/notification/NotificationService';
import type { ParcelStore } from '@/stores/ParcelStore';
import type { SettingsStore } from '@/stores/SettingsStore';

export interface ProximityState {
  tracking: boolean;
  position: GeoPoint | null;
  error: string | null;
}

/** Une fois sorti de ce multiple du rayon d'approche, le colis peut de nouveau déclencher ses alertes. */
const REARM_FACTOR = 3;

/**
 * Patron Facade : orchestre GPS + colis + réglages + notifications
 * derrière une API minimale (start / stop) pour les ViewModels.
 * Deux niveaux d'alerte : approche (rayon réglable) puis arrivée (50 m).
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
    const approachRadius = Math.max(this.settings.getSnapshot().alertRadius, ARRIVAL_RADIUS);

    for (const parcel of this.parcels.pending()) {
      const d = distanceMeters(position, parcel.address);

      if (d <= ARRIVAL_RADIUS && !parcel.arrivedNotifiedAt) {
        const now = Date.now();
        this.parcels.setNotified(parcel.id, { notifiedAt: parcel.notifiedAt ?? now, arrivedNotifiedAt: now });
        void this.notifier.notify(parcel, d, 'arrival');
      } else if (d <= approachRadius && !parcel.notifiedAt) {
        this.parcels.setNotified(parcel.id, { notifiedAt: Date.now() });
        void this.notifier.notify(parcel, d, 'approach');
      } else if (parcel.notifiedAt && d > approachRadius * REARM_FACTOR) {
        this.parcels.setNotified(parcel.id, { notifiedAt: undefined, arrivedNotifiedAt: undefined });
      }
    }
  };
}
