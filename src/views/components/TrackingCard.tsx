import { BellRing, BellOff } from 'lucide-react';

interface Props {
  tracking: boolean;
  error: string | null;
  onToggle: () => void;
}

export function TrackingCard({ tracking, error, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`card flex w-full items-center gap-4 text-left transition active:scale-[0.99] ${
        tracking ? 'ring-4 ring-mint-400' : ''
      }`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          tracking ? 'bg-mint-100 text-mint-600' : 'bg-coral-100 text-coral-600'
        }`}
      >
        {tracking ? <BellRing size={30} /> : <BellOff size={30} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 whitespace-nowrap text-lg font-extrabold">
          {tracking && <span className="pulse-dot" />}
          {tracking ? 'Alertes ON' : 'Alertes OFF'}
        </span>
        <span className="block text-sm font-semibold text-brand-900/60">
          {error ?? (tracking ? 'Je vous préviens près de chaque adresse' : 'Touchez pour démarrer la tournée')}
        </span>
      </span>
      <span className={`switch ${tracking ? 'switch--on' : ''}`} aria-hidden />
    </button>
  );
}
