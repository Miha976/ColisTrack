import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export class CameraService {
  /** Ouvre l'appareil photo et renvoie l'image en data URL, ou null si annulé. */
  async takePhoto(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.DataUrl,
        quality: 80,
        width: 1600,
        correctOrientation: true,
        saveToGallery: false,
      });
      return photo.dataUrl ?? null;
    } catch {
      return null; // annulation utilisateur
    }
  }
}
