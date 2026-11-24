import { Observable } from '@/core/Observable';
import { uid } from '@/core/id';
import type { NewParcel, Parcel } from '@/models/Parcel';
import type { ParcelRepository } from '@/services/storage/ParcelRepository';

export interface ParcelState {
  loaded: boolean;
  parcels: Parcel[];
}

/** Source de vérité des colis : chaque mutation notifie les vues puis persiste. */
export class ParcelStore extends Observable<ParcelState> {
  constructor(private readonly repo: ParcelRepository) {
    super({ loaded: false, parcels: [] });
  }

  async load(): Promise<void> {
    const parcels = await this.repo.findAll();
    this.setState({ loaded: true, parcels });
  }

  byId = (id: string) => this.state.parcels.find((p) => p.id === id);
  pending = () => this.state.parcels.filter((p) => p.status === 'pending');

  add(input: NewParcel): Parcel {
    const parcel: Parcel = { ...input, id: uid(), status: 'pending', createdAt: Date.now() };
    this.commit([parcel, ...this.state.parcels]);
    return parcel;
  }

  markDelivered = (id: string) => this.update(id, { status: 'delivered', deliveredAt: Date.now() });
  undoDelivered = (id: string) =>
    this.update(id, { status: 'pending', deliveredAt: undefined, notifiedAt: undefined, arrivedNotifiedAt: undefined });
  setNotified = (id: string, flags: Pick<Parcel, 'notifiedAt' | 'arrivedNotifiedAt'>) => this.update(id, flags);

  remove = (id: string) => this.commit(this.state.parcels.filter((p) => p.id !== id));
  clearDelivered = () => this.commit(this.state.parcels.filter((p) => p.status !== 'delivered'));

  private update(id: string, patch: Partial<Parcel>): void {
    this.commit(this.state.parcels.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  private commit(parcels: Parcel[]): void {
    this.setState((s) => ({ ...s, parcels }));
    void this.repo.saveAll(parcels);
  }
}
