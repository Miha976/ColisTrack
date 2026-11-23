import type { Address } from './Address';

export type ParcelSize = 'small' | 'medium' | 'large';
export type ParcelStatus = 'pending' | 'delivered';

export interface Parcel {
  id: string;
  address: Address;
  size: ParcelSize;
  recipient?: string;
  note?: string;
  /** Miniature JPEG (data URL) pour reconnaître le colis */
  photo?: string;
  status: ParcelStatus;
  createdAt: number;
  deliveredAt?: number;
  /** Horodatage de la dernière alerte de proximité */
  notifiedAt?: number;
}

export type NewParcel = Pick<Parcel, 'address' | 'size' | 'recipient' | 'note' | 'photo'>;

export const SIZE_META: Record<ParcelSize, { label: string; emoji: string; tone: string }> = {
  small: { label: 'Petit', emoji: '📦', tone: 'sky' },
  medium: { label: 'Moyen', emoji: '📦📦', tone: 'sun' },
  large: { label: 'Gros', emoji: '🚚', tone: 'coral' },
};
