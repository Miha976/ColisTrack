# ColiTrack — assistant de tournée pour facteur de colis

React 19 + TypeScript + Vite + Capacitor 8 (Android). Tailwind CSS 3 compilé via SCSS.

## Fonctionnalités
- **Scanner** l'étiquette (photo → OCR Tesseract → extraction de l'adresse → validation via l'API Géoplateforme IGN), ou saisie manuelle avec autocomplétion.
- **Taille du colis** (petit / moyen / gros) : les gros colis sont mis en évidence partout (bandeau, contour, alertes).
- **Alerte de proximité** (rayon réglable 100–800 m), même quand Waze est au premier plan (service GPS d'arrière-plan). Actions directes dans la notification : « Waze » et « Livré ». Ré-armement automatique si on s'éloigne sans livrer.
- **Navigation Waze** en un geste, **marquer comme livré** / annuler.
- Liste triée par distance (le plus proche en premier).

## Lancer
```bash
npm install
npm run dev            # navigateur (GPS au premier plan uniquement)
npm test               # tests unitaires (géo, extraction d'adresse)
npm run android        # build + sync + ouvre Android Studio
```
Prérequis Android : Android Studio, JDK 21, appareil Android 8+.

## Architecture (MVVM)
```
src/
  models/        Model : types métier (Parcel, Address, Settings)
  core/          Fonctions pures testables (Haversine, extraction d'adresse, Observable)
  services/      Accès plateforme & réseau (caméra, OCR, géocodage, GPS, notifications, Waze, stockage)
  stores/        État observable de l'application (ParcelStore, SettingsStore)
  viewmodels/    Hooks ViewModel : état dérivé + commandes, aucune logique dans les vues
  views/         Vues React (pages + composants)
  di/            Composition root + contexte d'injection
  styles/        SCSS (tokens, base, layout, composants) + directives Tailwind
```

| Patron | Où |
|---|---|
| Observer | `core/Observable.ts` + `useSyncExternalStore` |
| Repository | `services/storage/ParcelRepository.ts` |
| Adapter | `services/geocoding/IgnGeocodingAdapter.ts` (GeoJSON IGN → `Address`) |
| Strategy | `services/ocr/*` (Tesseract remplaçable par ML Kit), `services/location/*` (arrière-plan natif / navigateur) |
| Facade | `services/proximity/ProximityMonitor.ts` (GPS + colis + réglages + notifications) |
| Injection de dépendances / Singleton | `di/container.ts`, `di/ServicesContext.tsx` |
| Machine à états | étapes de `useAddParcelViewModel` |

## Points d'attention
- L'OCR et le géocodage ont besoin d'Internet (données de langue Tesseract téléchargées au 1er scan, puis en cache).
- Android 10+ : pour les alertes en arrière-plan, accepter la localisation « Toujours » / « Pendant l'utilisation » et les notifications.
- Certains constructeurs (Xiaomi, Huawei, Samsung) coupent les services d'arrière-plan : désactiver l'optimisation de batterie pour ColiTrack.
- Note Tailwind : les classes de `@layer components` doivent apparaître en toutes lettres dans le code (sinon purgées).

## Installer sur un téléphone sans ordinateur
Chaque push sur `main` lance l'action **Android APK** (onglet *Actions*), qui compile l'appli et publie
`ColiTrack.apk` dans la release **latest** (onglet *Releases*). Sur le téléphone Android :
ouvrir la release, télécharger `ColiTrack.apk`, autoriser « Installer des applis inconnues » pour le navigateur, installer.
