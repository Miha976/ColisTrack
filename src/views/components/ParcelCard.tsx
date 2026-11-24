import { Check, Navigation, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '@/core/geo';
import type { Parcel } from '@/models/Parcel';

interface Props {
  parcel: Parcel;
  distance: number | null;
  highlight?: boolean;
  onDeliver: () => void;
  onUndo: () => void;
  onNavigate: () => void;
}

export function ParcelCard({ parcel, distance, highlight, onDeliver, onUndo, onNavigate }: Props) {
  const done = parcel.status === 'delivered';
  const cls = done ? 'parcel-card parcel-card--done' : 'parcel-card';

  return (
    <article className={cls}>
      {highlight && !done && (
        <span className="absolute right-0 top-0 rounded-bl-2xl bg-mint-500 px-3 py-1 text-xs font-extrabold uppercase text-white">
          Le plus proche
        </span>
      )}
      <Link to={`/colis/${parcel.id}`} className={`flex items-center gap-4 ${highlight && !done ? 'pt-5' : ''}`}>
        <div className="parcel-card__thumb">{parcel.photo ? <img src={parcel.photo} alt="" /> : '🚚'}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold leading-tight">{parcel.address.street}</p>
          <p className="truncate text-base font-semibold text-brand-900/60">
            {parcel.address.postcode} {parcel.address.city}
          </p>
          {parcel.recipient && <p className="truncate text-sm font-bold text-brand-700">👤 {parcel.recipient}</p>}
          {distance != null && !done && <span className="chip mt-2">📍 {formatDistance(distance)}</span>}
        </div>
      </Link>

      {done ? (
        <button className="btn btn--soft" onClick={onUndo}>
          <RotateCcw size={22} /> Annuler la livraison
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn--sky" onClick={onNavigate}>
            <Navigation size={22} /> Y aller
          </button>
          <button className="btn btn--mint" onClick={onDeliver}>
            <Check size={24} strokeWidth={3} /> Livré
          </button>
        </div>
      )}
    </article>
  );
}
