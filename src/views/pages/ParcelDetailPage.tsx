import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Navigation, RotateCcw, Trash2 } from 'lucide-react';
import { formatDistance } from '@/core/geo';
import { useParcelDetailViewModel } from '@/viewmodels/useParcelDetailViewModel';
import { PageHeader } from '../components/PageHeader';
import { SizeBadge } from '../components/SizeBadge';

export function ParcelDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const vm = useParcelDetailViewModel(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!vm.parcel) {
    return (
      <div className="page">
        <PageHeader title="Colis introuvable" onBack={() => navigate('/')} />
      </div>
    );
  }

  const { parcel } = vm;
  const done = parcel.status === 'delivered';

  return (
    <div className="page">
      <PageHeader title="Détail du colis" onBack={() => navigate(-1)} />

      {parcel.photo ? (
        <img src={parcel.photo} alt="Étiquette du colis" className="max-h-64 w-full rounded-4xl object-cover shadow-soft" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-4xl bg-brand-100 text-7xl">📦</div>
      )}

      <section className={`card flex flex-col gap-3 ${parcel.size === 'large' && !done ? 'ring-4 ring-coral-400' : ''}`}>
        <div className="flex flex-wrap items-center gap-2">
          <SizeBadge size={parcel.size} />
          {vm.distance != null && <span className="chip">📍 à {formatDistance(vm.distance)}</span>}
          {done && <span className="chip bg-mint-100 text-mint-600">✅ Livré</span>}
        </div>
        <p className="text-2xl font-black leading-tight">{parcel.address.street}</p>
        <p className="text-lg font-bold text-brand-900/60">
          {parcel.address.postcode} {parcel.address.city}
        </p>
        {parcel.recipient && <p className="text-lg font-bold">👤 {parcel.recipient}</p>}
        {parcel.note && <p className="rounded-2xl bg-sun-100 p-3 font-bold text-amber-800">📝 {parcel.note}</p>}
      </section>

      <div className="flex flex-col gap-3">
        <button className="btn btn--sky btn--xl btn--block" onClick={vm.navigate}>
          <Navigation size={28} /> Y aller avec Waze
        </button>
        {done ? (
          <button className="btn btn--soft btn--block" onClick={vm.undo}>
            <RotateCcw size={24} /> Annuler la livraison
          </button>
        ) : (
          <button
            className="btn btn--mint btn--xl btn--block"
            onClick={() => {
              vm.deliver();
              navigate('/');
            }}
          >
            <Check size={30} strokeWidth={3} /> Marquer comme livré
          </button>
        )}
        <button
          className="btn btn--danger btn--block"
          onClick={() => {
            if (!confirmDelete) return setConfirmDelete(true);
            vm.remove();
            navigate('/', { replace: true });
          }}
        >
          <Trash2 size={22} /> {confirmDelete ? 'Toucher encore pour supprimer' : 'Supprimer'}
        </button>
      </div>
    </div>
  );
}
