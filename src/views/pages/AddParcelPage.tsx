import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, Keyboard, Loader2, MapPin, Save } from 'lucide-react';
import { useAddParcelViewModel } from '@/viewmodels/useAddParcelViewModel';
import { PageHeader } from '../components/PageHeader';

const STEP_TITLES = { start: 'Nouveau gros colis', reading: 'Lecture…', address: 'Quelle adresse ?', details: 'Dernière étape' };

export function AddParcelPage() {
  const vm = useAddParcelViewModel();
  const navigate = useNavigate();

  const onSave = () => {
    if (vm.save()) navigate('/', { replace: true });
  };

  return (
    <div className="page">
      <PageHeader title={STEP_TITLES[vm.step]} onBack={vm.step === 'start' ? () => navigate(-1) : vm.back} />

      {vm.step === 'start' && (
        <div className="flex flex-col gap-4">
          <button className="btn btn--coral btn--xl btn--block h-44 flex-col" onClick={vm.takePhoto}>
            <Camera size={60} strokeWidth={2} />
            Photographier l’étiquette
          </button>
          <button className="btn btn--primary btn--block" onClick={vm.pickFromGallery}>
            <ImagePlus size={26} /> Choisir dans la galerie
          </button>
          <button className="btn btn--soft btn--block" onClick={vm.typeManually}>
            <Keyboard size={24} /> Taper l’adresse
          </button>
          <p className="text-center text-base font-semibold text-brand-900/60">
            Cadrez bien l’adresse du destinataire, en pleine lumière.
          </p>
        </div>
      )}

      {vm.step === 'reading' && (
        <div className="card flex flex-col items-center gap-4 py-12">
          <Loader2 size={56} className="animate-spin text-brand-500" />
          <p className="text-xl font-extrabold">Je lis l’adresse…</p>
        </div>
      )}

      {vm.step === 'address' && (
        <div className="flex flex-col gap-4">
          {vm.photo && <img src={vm.photo} alt="Étiquette" className="max-h-40 w-full rounded-3xl object-cover shadow-soft" />}
          <div>
            <label className="label" htmlFor="q">Adresse lue (modifiable)</label>
            <input
              id="q"
              className="input"
              value={vm.query}
              onChange={(e) => vm.setQuery(e.target.value)}
              placeholder="Ex : 12 rue des Lilas Paris"
              autoComplete="off"
              autoFocus={!vm.photo}
            />
          </div>
          {vm.error && <p className="rounded-2xl bg-sun-100 p-3 font-bold text-amber-800">{vm.error}</p>}

          <p className="label mb-0">Touchez la bonne adresse :</p>
          {vm.searching && <Loader2 className="mx-auto animate-spin text-brand-500" size={32} />}
          <ul className="flex flex-col gap-3">
            {vm.suggestions.map((a) => (
              <li key={`${a.lat},${a.lng},${a.label}`}>
                <button className="card flex w-full items-center gap-3 text-left active:scale-[0.99]" onClick={() => vm.chooseAddress(a)}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                    <MapPin size={26} />
                  </span>
                  <span>
                    <span className="block text-lg font-extrabold leading-tight">{a.street}</span>
                    <span className="block font-semibold text-brand-900/60">{a.postcode} {a.city}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vm.step === 'details' && vm.address && (
        <div className="flex flex-col gap-5">
          <div className="card flex items-center gap-3 bg-brand-600 text-white">
            <MapPin size={30} />
            <p className="text-lg font-extrabold leading-tight">{vm.address.label}</p>
          </div>

          <div>
            <label className="label" htmlFor="r">Destinataire (facultatif)</label>
            <input id="r" className="input" value={vm.recipient} onChange={(e) => vm.setRecipient(e.target.value)} placeholder="Nom" />
          </div>
          <div>
            <label className="label" htmlFor="n">Note (facultatif)</label>
            <input id="n" className="input" value={vm.note} onChange={(e) => vm.setNote(e.target.value)} placeholder="Ex : digicode 1234, à l’arrière du camion" />
          </div>

          <button className="btn btn--primary btn--xl btn--block" onClick={onSave}>
            <Save size={28} /> Enregistrer
          </button>
        </div>
      )}
    </div>
  );
}
