import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.colitrack.app',
  appName: 'ColiTrack',
  webDir: 'dist',
  plugins: {
    LocalNotifications: { iconColor: '#6C63FF' },
  },
};

export default config;
