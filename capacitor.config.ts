import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.965a4c3c916246a4a576edb6af5631bb',
  appName: 'fit-mind-sync',
  webDir: 'dist',
  server: {
    url: 'https://965a4c3c-9162-46a4-a576-edb6af5631bb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;
