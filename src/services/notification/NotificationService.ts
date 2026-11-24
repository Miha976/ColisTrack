import { LocalNotifications } from '@capacitor/local-notifications';
import type { Parcel } from '@/models/Parcel';
import { formatDistance } from '@/core/geo';

export type NotificationAction = { type: 'open' | 'deliver' | 'navigate'; parcelId: string };
export type AlertLevel = 'approach' | 'arrival';

/**
 * Le son d'un canal Android est figé à sa création : changer de son impose un nouvel id de canal.
 * Fichiers dans android/app/src/main/res/raw (sons Ion.Sound, licence MIT).
 */
const CHANNELS: Record<AlertLevel, { id: string; name: string; sound: string; description: string }> = {
  approach: {
    id: 'approach_v2',
    name: 'Approche d’un colis',
    sound: 'alerte_approche.ogg',
    description: 'Vous approchez d’une adresse de livraison',
  },
  arrival: {
    id: 'arrival_v2',
    name: 'Arrivée à l’adresse (50 m)',
    sound: 'alerte_arrivee.ogg',
    description: 'Vous êtes devant l’adresse : le colis est à livrer ici',
  },
};
const LEGACY_CHANNELS = ['proximity'];
const ACTION_TYPE = 'PARCEL_NEAR';

/** Hash stable 32 bits : un identifiant par colis, l'alerte d'arrivée remplace celle d'approche. */
const toNotificationId = (id: string) =>
  [...id].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 7) & 0x7fffffff;

export class NotificationService {
  async init(onAction: (action: NotificationAction) => void): Promise<void> {
    await LocalNotifications.requestPermissions();
    try {
      await Promise.all(LEGACY_CHANNELS.map((id) => LocalNotifications.deleteChannel({ id })));
      for (const c of Object.values(CHANNELS)) {
        await LocalNotifications.createChannel({ ...c, importance: 5, vibration: true, visibility: 1 });
      }
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: ACTION_TYPE,
            actions: [
              { id: 'navigate', title: '🧭 Waze' },
              { id: 'deliver', title: '✅ Livré' },
            ],
          },
        ],
      });
    } catch {
      /* non supporté sur le web */
    }
    await LocalNotifications.addListener('localNotificationActionPerformed', ({ actionId, notification }) => {
      const parcelId = notification.extra?.parcelId as string | undefined;
      if (!parcelId) return;
      const type = actionId === 'deliver' || actionId === 'navigate' ? actionId : 'open';
      onAction({ type, parcelId });
    });
  }

  async notify(parcel: Parcel, distance: number, level: AlertLevel): Promise<void> {
    const channel = CHANNELS[level];
    await LocalNotifications.schedule({
      notifications: [
        {
          id: toNotificationId(parcel.id),
          channelId: channel.id,
          sound: channel.sound, // Android < 8
          actionTypeId: ACTION_TYPE,
          title: level === 'arrival' ? '🛑 VOUS Y ÊTES : gros colis à livrer ICI' : '🚚 Gros colis à livrer bientôt',
          body: `${parcel.address.label} — à ${formatDistance(distance)}`,
          largeBody: [parcel.address.label, parcel.recipient, parcel.note].filter(Boolean).join('\n'),
          extra: { parcelId: parcel.id },
        },
      ],
    });
  }

  /** Envoie une alerte de chaque niveau pour que le facteur reconnaisse les sons. */
  async test(): Promise<void> {
    const sample = { label: 'Exemple : 12 rue des Lilas' } as Parcel['address'];
    const parcel = { id: 'test', address: sample } as Parcel;
    await this.notify(parcel, 180, 'approach');
    setTimeout(() => void this.notify({ ...parcel, id: 'test-2' }, 40, 'arrival'), 4000);
  }
}
