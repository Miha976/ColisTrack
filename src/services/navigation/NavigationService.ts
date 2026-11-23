import { AppLauncher } from '@capacitor/app-launcher';
import type { GeoPoint } from '@/models/Address';

export class WazeNavigationService {
  async navigateTo({ lat, lng }: GeoPoint): Promise<void> {
    const deepLink = `waze://?ll=${lat},${lng}&navigate=yes`;
    try {
      const { value } = await AppLauncher.canOpenUrl({ url: 'com.waze' });
      if (value) {
        await AppLauncher.openUrl({ url: deepLink });
        return;
      }
    } catch {
      /* web ou plugin indisponible : on bascule sur le lien universel */
    }
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_system');
  }
}
