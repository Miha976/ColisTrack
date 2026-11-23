import { LocalNotifications } from '@capacitor/local-notifications';
import type { Parcel } from '@/models/Parcel';
import { formatDistance } from '@/core/geo';

export type NotificationAction = { type: 'open' | 'deliver' | 'navigate'; parcelId: string };

const CHANNEL_ID = 'proximity';
const ACTION_TYPE = 'PARCEL_NEAR';

/** Hash stable 32 bits : Android exige un identifiant entier par notification. */
const toNotificationId = (id: string) =>
  [...id].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 7) & 0x7fffffff;

export class NotificationService {
  async init(onAction: (action: NotificationAction) => void): Promise<void> {
    await LocalNotifications.requestPermissions();
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Colis à proximité',
        description: 'Alerte quand vous approchez d’une adresse de livraison',
        importance: 5,
        vibration: true,
        visibility: 1,
      });
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

  async notifyNear(parcel: Parcel, distance: number): Promise<void> {
    const big = parcel.size === 'large';
    await LocalNotifications.schedule({
      notifications: [
        {
          id: toNotificationId(parcel.id),
          channelId: CHANNEL_ID,
          actionTypeId: ACTION_TYPE,
          title: big ? '🚚 GROS colis à livrer ici !' : '📦 Colis à livrer ici',
          body: `${parcel.address.label} — à ${formatDistance(distance)}`,
          largeBody: `${parcel.address.label}\n${parcel.recipient ?? ''}\n${parcel.note ?? ''}`.trim(),
          extra: { parcelId: parcel.id },
        },
      ],
    });
  }
}
