import { SIZE_META, type ParcelSize } from '@/models/Parcel';

// Classes écrites en entier : Tailwind purge les noms construits dynamiquement.
const CLASSES: Record<ParcelSize, string> = {
  small: 'size-badge size-badge--small',
  medium: 'size-badge size-badge--medium',
  large: 'size-badge size-badge--large',
};

export function SizeBadge({ size }: { size: ParcelSize }) {
  return (
    <span className={CLASSES[size]}>
      {size === 'large' && '⚠️'} {SIZE_META[size].label}
    </span>
  );
}
