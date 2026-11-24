# ColiTrack — assistant de tournée pour facteur de colis

React 19 + TypeScript + Vite + Capacitor 8 (Android). Tailwind CSS 3 compilé via SCSS.

## Fonctionnalités
- **Uniquement les gros colis** : le facteur n'enregistre que ceux qu'il risque d'oublier, sans préciser de taille.
- **Ajout** par photo de l'étiquette, **image de la galerie**, ou saisie manuelle avec autocomplétion
  (photo → OCR Tesseract → extraction de l'adresse → validation via l'API Géoplateforme IGN).
- **Deux alertes sonores** :
  1. *Approche* (rayon réglable 100–800 m), son de sonnette ;
  2. *Arrivée* à **50 m**, son de cloche répété, plus insistant.
  Toutes deux fonctionnent quand Waze est au premier plan (service GPS d'arrière-plan), avec actions « Waze » et « Livré »
  dans la notification, et se réarment si l'on s'éloigne à plus de 3 × le rayon sans livrer. Bouton « Tester les alertes » dans Réglages.
- **Navigation Waze** en un geste, **marquer comme livré** / annuler, liste triée par distance.

Sons : [Ion.Sound](https://github.com/IonDen/ion.sound) (licence MIT) — `door_bell` (approche) et `bell_ring` ×3 (arrivée),
dans `android/app/src/main/res/raw/`.

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
- Le son d'un canal de notification Android est figé à sa création : pour changer un son, créer un canal avec un nouvel id (`approach_v3`…).
- APK signé avec une clé de test commitée (`android/app/colitrack-debug.keystore`) pour permettre les mises à jour ; une clé privée distincte sera nécessaire pour le Play Store.
- Note Tailwind : les classes de `@layer components` doivent apparaître en toutes lettres dans le code (sinon purgées).

## Installer sur un téléphone sans ordinateur
Chaque push sur `main` lance l'action **Android APK** (onglet *Actions*), qui compile l'appli et publie
`ColiTrack.apk` dans la release **latest** (onglet *Releases*). Sur le téléphone Android :
ouvrir la release, télécharger `ColiTrack.apk`, autoriser « Installer des applis inconnues » pour le navigateur, installer.
