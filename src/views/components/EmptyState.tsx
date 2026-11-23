import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export function EmptyState({ delivered }: { delivered: boolean }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-6xl">{delivered ? '🎉' : '📭'}</span>
      <p className="text-xl font-extrabold">{delivered ? 'Aucun colis livré pour l’instant' : 'Aucun colis à livrer'}</p>
      {!delivered && (
        <>
          <p className="font-semibold text-brand-900/60">Scannez l’étiquette de vos colis au chargement du camion.</p>
          <Link to="/ajouter" className="btn btn--coral mt-2">
            <Camera size={24} /> Scanner un colis
          </Link>
        </>
      )}
    </div>
  );
}
