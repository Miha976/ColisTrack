import { useState } from 'react';
import { BellRing, Trash2 } from 'lucide-react';
import { RADIUS_OPTIONS, useSettingsViewModel } from '@/viewmodels/useSettingsViewModel';
import { PageHeader } from '../components/PageHeader';

export function SettingsPage() {
  const vm = useSettingsViewModel();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="page">
      <PageHeader title="Réglages" />

      <section className="card flex flex-col gap-3">
        <p className="text-lg font-extrabold">1re alerte : me prévenir à</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => vm.setRadius(r)}
              className={`btn ${vm.settings.alertRadius === r ? 'btn--primary' : 'btn--soft'}`}
            >
              {r} m
            </button>
          ))}
        </div>
        <p className="font-semibold text-brand-900/60">de l’adresse de livraison.</p>
        <p className="rounded-2xl bg-coral-100 p-3 font-bold text-coral-600">
          🛑 2e alerte, plus forte, à {vm.arrivalRadius} m : vous êtes devant l’adresse.
        </p>
      </section>

      <section className="card flex flex-col gap-3">
        <p className="text-lg font-extrabold">Sons des alertes</p>
        <p className="font-semibold text-brand-900/60">Écoutez les deux alertes pour les reconnaître en tournée.</p>
        <button className="btn btn--mint btn--block" onClick={vm.testAlerts}>
          <BellRing size={24} /> Tester les alertes
        </button>
      </section>

      <section className="card flex flex-col gap-3">
        <p className="text-lg font-extrabold">Fin de tournée</p>
        <button
          className="btn btn--danger btn--block"
          disabled={vm.deliveredCount === 0}
          onClick={() => {
            if (!confirm) return setConfirm(true);
            vm.clearDelivered();
            setConfirm(false);
          }}
        >
          <Trash2 size={22} />
          {confirm
            ? 'Toucher encore pour confirmer'
            : vm.deliveredCount === 1
              ? 'Effacer le colis livré'
              : `Effacer les ${vm.deliveredCount} colis livrés`}
        </button>
      </section>
    </div>
  );
}
