import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function PageHeader({ title, onBack, right }: Props) {
  return (
    <header className="flex items-center gap-3">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Retour">
          <ArrowLeft size={26} strokeWidth={2.75} />
        </button>
      )}
      <h1 className="flex-1 text-2xl text-brand-900">{title}</h1>
      {right}
    </header>
  );
}
