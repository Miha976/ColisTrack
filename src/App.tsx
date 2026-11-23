import { Route, Routes } from 'react-router-dom';
import { useAppBootstrap } from '@/viewmodels/useAppBootstrap';
import { BottomNav } from '@/views/components/BottomNav';
import { TourPage } from '@/views/pages/TourPage';
import { AddParcelPage } from '@/views/pages/AddParcelPage';
import { ParcelDetailPage } from '@/views/pages/ParcelDetailPage';
import { SettingsPage } from '@/views/pages/SettingsPage';

export function App() {
  useAppBootstrap();

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<TourPage />} />
        <Route path="/ajouter" element={<AddParcelPage />} />
        <Route path="/colis/:id" element={<ParcelDetailPage />} />
        <Route path="/reglages" element={<SettingsPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
