import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Rork PWA',
  slug: 'rork-pwa',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rork.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.rork.app'
  },
  web: {
    bundler: 'metro',
    name: 'Rork PWA',
    display: 'standalone',
    shortName: 'Rork PWA',
    themeColor: '#5B21B6',
    backgroundColor: '#FFFFFF',
    startUrl: '/',
    scope: '/',
    favicon: './assets/favicon.png',
    icons: [
      {
        src: './assets/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: './assets/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF'
    }
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        web: {
          bundler: 'metro'
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  }
});
