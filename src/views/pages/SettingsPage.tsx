import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { RADIUS_OPTIONS, useSettingsViewModel } from '@/viewmodels/useSettingsViewModel';
import { PageHeader } from '../components/PageHeader';
import { Switch } from '../components/Switch';

export function SettingsPage() {
  const vm = useSettingsViewModel();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="page">
      <PageHeader title="Réglages" />

      <section className="card flex flex-col gap-3">
        <p className="text-lg font-extrabold">Me prévenir à</p>
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
      </section>

      <section className="card flex items-center gap-4">
        <div className="flex-1">
          <p className="text-lg font-extrabold">Seulement les gros colis</p>
          <p className="font-semibold text-brand-900/60">Moins d’alertes, pour ne jamais oublier les gros.</p>
        </div>
        <Switch checked={vm.settings.largeOnly} onChange={vm.setLargeOnly} label="Seulement les gros colis" />
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
          {confirm ? 'Toucher encore pour confirmer' : vm.deliveredCount === 1 ? "Effacer le colis livré" : `Effacer les ${vm.deliveredCount} colis livrés`}
        </button>
      </section>
    </div>
  );
}
