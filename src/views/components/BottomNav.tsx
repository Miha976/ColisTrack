import { NavLink } from 'react-router-dom';
import { Camera, ListChecks, Settings } from 'lucide-react';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`;

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <NavLink to="/" end className={itemClass}>
        <ListChecks size={28} strokeWidth={2.5} />
        Tournée
      </NavLink>
      <NavLink to="/ajouter" className="bottom-nav__scan" aria-label="Scanner un colis">
        <Camera size={32} strokeWidth={2.5} />
        Scanner
      </NavLink>
      <NavLink to="/reglages" className={itemClass}>
        <Settings size={28} strokeWidth={2.5} />
        Réglages
      </NavLink>
    </nav>
  );
}
