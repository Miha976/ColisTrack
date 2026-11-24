import { useTourViewModel } from '@/viewmodels/useTourViewModel';
import { ParcelCard } from '../components/ParcelCard';
import { TrackingCard } from '../components/TrackingCard';
import { EmptyState } from '../components/EmptyState';

export function TourPage() {
  const vm = useTourViewModel();
  const { total, delivered, remaining } = vm.progress;
  const percent = total ? Math.round((delivered / total) * 100) : 0;

  return (
    <div className="page">
      <section className="hero">
        <p className="text-base font-bold text-white/80">Ma tournée du jour</p>
        <p className="mt-1 text-4xl font-black">
          {remaining} <span className="text-2xl font-extrabold">gros colis à livrer</span>
        </p>
        <div className="progress mt-4">
          <div className="progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm font-bold text-white/80">
          {delivered} / {total} livrés
        </p>
      </section>

      <TrackingCard tracking={vm.tracking} error={vm.trackingError} onToggle={vm.toggleTracking} />

      <div className="segmented" role="tablist">
        {(['pending', 'delivered'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={vm.tab === t}
            onClick={() => vm.setTab(t)}
            className={`segmented__btn ${vm.tab === t ? 'segmented__btn--active' : ''}`}
          >
            {t === 'pending' ? `À livrer (${remaining})` : `Livrés (${delivered})`}
          </button>
        ))}
      </div>

      {vm.loaded && vm.items.length === 0 ? (
        <EmptyState delivered={vm.tab === 'delivered'} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vm.items.map(({ parcel, distance }, i) => (
            <ParcelCard
              key={parcel.id}
              parcel={parcel}
              distance={distance}
              highlight={i === 0 && distance != null}
              onDeliver={() => vm.deliver(parcel.id)}
              onUndo={() => vm.undo(parcel.id)}
              onNavigate={() => vm.navigate(parcel)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
