import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export class CameraService {
  /** Appareil photo ou galerie ; renvoie l'image en data URL, ou null si annulé. */
  takePhoto = () => this.getImage(CameraSource.Camera);
  pickFromGallery = () => this.getImage(CameraSource.Photos);

  private async getImage(source: CameraSource): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        source,
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
