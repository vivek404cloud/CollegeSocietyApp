import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/navigation/root/RootNavigator';
import { AppProviders } from '@/store/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppProviders>
  );
}
