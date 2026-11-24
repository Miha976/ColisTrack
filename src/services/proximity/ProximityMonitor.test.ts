import { describe, expect, it } from 'vitest';
import type { GeoPoint } from '@/models/Address';
import type { Parcel } from '@/models/Parcel';
import { DEFAULT_SETTINGS } from '@/models/Settings';
import type { LocationTracker } from '@/services/location/LocationTracker';
import type { AlertLevel, NotificationService } from '@/services/notification/NotificationService';
import type { ParcelRepository } from '@/services/storage/ParcelRepository';
import type { SettingsRepository } from '@/services/storage/SettingsRepository';
import { ParcelStore } from '@/stores/ParcelStore';
import { SettingsStore } from '@/stores/SettingsStore';
import { ProximityMonitor } from './ProximityMonitor';

const TARGET: GeoPoint = { lat: 48.85, lng: 2.35 };
/** Point situé à `m` mètres au nord de la cible (1° de latitude ≈ 111 195 m). */
const north = (m: number): GeoPoint => ({ lat: TARGET.lat + m / 111_195, lng: TARGET.lng });

async function setup() {
  const repo: ParcelRepository = { findAll: async () => [], saveAll: async () => {} };
  const parcels = new ParcelStore(repo);
  const settings = new SettingsStore({ load: async () => DEFAULT_SETTINGS, save: async () => {} } as unknown as SettingsRepository);
  const alerts: AlertLevel[] = [];
  const notifier = { notify: async (_p: Parcel, _d: number, level: AlertLevel) => void alerts.push(level) } as unknown as NotificationService;
  let emit: (p: GeoPoint) => void = () => {};
  const tracker: LocationTracker = { start: async (cb) => void (emit = cb), stop: async () => {} };

  const monitor = new ProximityMonitor(tracker, notifier, parcels, settings);
  parcels.add({ address: { ...TARGET, label: 'x', street: 'x', postcode: '75000', city: 'Paris' } });
  await monitor.start();
  return { alerts, move: (m: number) => emit(north(m)) };
}

describe('ProximityMonitor (rayon d’approche 200 m, arrivée 50 m)', () => {
  it('envoie une alerte d’approche puis une alerte d’arrivée, une seule fois chacune', async () => {
    const { alerts, move } = await setup();
    [500, 190, 120, 45, 30, 20].forEach(move);
    expect(alerts).toEqual(['approach', 'arrival']);
  });

  it('envoie directement l’alerte d’arrivée si la 1re position est déjà à moins de 50 m', async () => {
    const { alerts, move } = await setup();
    [40, 150].forEach(move);
    expect(alerts).toEqual(['arrival']);
  });

  it('réarme les deux alertes après un éloignement à plus de 3 × 200 m', async () => {
    const { alerts, move } = await setup();
    [150, 40, 700, 150, 40].forEach(move);
    expect(alerts).toEqual(['approach', 'arrival', 'approach', 'arrival']);
  });

  it('ne réarme pas tant qu’on reste entre 200 et 600 m', async () => {
    const { alerts, move } = await setup();
    [150, 400, 150].forEach(move);
    expect(alerts).toEqual(['approach']);
  });
});
