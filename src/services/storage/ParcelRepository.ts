import type { Parcel } from '@/models/Parcel';
import type { KeyValueStorage } from './KeyValueStorage';

/** Patron Repository : isole la persistance des colis du reste de l'application. */
export interface ParcelRepository {
  findAll(): Promise<Parcel[]>;
  saveAll(parcels: Parcel[]): Promise<void>;
}

export class LocalParcelRepository implements ParcelRepository {
  private static readonly KEY = 'parcels.v1';

  constructor(private readonly storage: KeyValueStorage) {}

  async findAll(): Promise<Parcel[]> {
    return (await this.storage.get<Parcel[]>(LocalParcelRepository.KEY)) ?? [];
  }

  saveAll(parcels: Parcel[]): Promise<void> {
    return this.storage.set(LocalParcelRepository.KEY, parcels);
  }
}
