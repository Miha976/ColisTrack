import { Capacitor } from '@capacitor/core';
import { PreferencesStorage } from '@/services/storage/KeyValueStorage';
import { LocalParcelRepository } from '@/services/storage/ParcelRepository';
import { SettingsRepository } from '@/services/storage/SettingsRepository';
import { IgnGeocodingAdapter } from '@/services/geocoding/IgnGeocodingAdapter';
import { TesseractOcrStrategy } from '@/services/ocr/TesseractOcrStrategy';
import { CameraService } from '@/services/camera/CameraService';
import { WazeNavigationService } from '@/services/navigation/NavigationService';
import { NotificationService } from '@/services/notification/NotificationService';
import { BackgroundLocationTracker } from '@/services/location/BackgroundLocationTracker';
import { ForegroundLocationTracker } from '@/services/location/ForegroundLocationTracker';
import { ProximityMonitor } from '@/services/proximity/ProximityMonitor';
import { ParcelStore } from '@/stores/ParcelStore';
import { SettingsStore } from '@/stores/SettingsStore';

/** Composition root : seul endroit où les implémentations concrètes sont choisies (injection de dépendances). */
export function createContainer() {
  const storage = new PreferencesStorage();
  const parcelStore = new ParcelStore(new LocalParcelRepository(storage));
  const settingsStore = new SettingsStore(new SettingsRepository(storage));
  const notifications = new NotificationService();
  const tracker = Capacitor.isNativePlatform() ? new BackgroundLocationTracker() : new ForegroundLocationTracker();

  return {
    parcelStore,
    settingsStore,
    notifications,
    geocoding: new IgnGeocodingAdapter(),
    ocr: new TesseractOcrStrategy(),
    camera: new CameraService(),
    navigation: new WazeNavigationService(),
    proximity: new ProximityMonitor(tracker, notifications, parcelStore, settingsStore),
  };
}

export type Container = ReturnType<typeof createContainer>;
