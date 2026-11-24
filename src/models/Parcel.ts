import type { Address } from './Address';

/** Un colis suivi = un gros colis (le facteur ne saisit que ceux-là). */
export type ParcelStatus = 'pending' | 'delivered';

export interface Parcel {
  id: string;
  address: Address;
  recipient?: string;
  note?: string;
  /** Miniature JPEG (data URL) pour reconnaître le colis */
  photo?: string;
  status: ParcelStatus;
  createdAt: number;
  deliveredAt?: number;
  /** Alerte d'approche (rayon réglable) déjà envoyée */
  notifiedAt?: number;
  /** Alerte d'arrivée (50 m) déjà envoyée */
  arrivedNotifiedAt?: number;
}

export type NewParcel = Pick<Parcel, 'address' | 'recipient' | 'note' | 'photo'>;
