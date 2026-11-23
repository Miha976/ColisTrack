import { SIZE_META, type ParcelSize } from '@/models/Parcel';

const SIZES: ParcelSize[] = ['small', 'medium', 'large'];
const ACTIVE: Record<ParcelSize, string> = {
  small: 'bg-sky-500 text-white shadow-soft',
  medium: 'bg-sun-400 text-ink shadow-soft',
  large: 'bg-coral-500 text-white shadow-coral',
};

export function SizePicker({ value, onChange }: { value: ParcelSize; onChange: (s: ParcelSize) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Taille du colis">
      {SIZES.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s)}
            className={`flex flex-col items-center gap-1 rounded-3xl py-4 font-extrabold transition active:scale-95 ${
              active ? ACTIVE[s] : 'bg-white text-brand-900/70 shadow-soft'
            }`}
          >
            <span className={s === 'small' ? 'text-2xl' : s === 'medium' ? 'text-3xl' : 'text-4xl'}>📦</span>
            {SIZE_META[s].label}
          </button>
        );
      })}
    </div>
  );
}
