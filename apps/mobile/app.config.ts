import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'OneHour Distill',
  slug: 'one-hour-distill',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.vibhorjain.booksummaries'
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PROJECT_ID ?? 'SET_IN_EXPO_DASHBOARD'
    }
  }
};

export default config;
