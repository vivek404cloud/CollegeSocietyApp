import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FullScreenLoader } from '@/components/feedback/FullScreenLoader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { AuthNavigator } from '@/navigation/auth/AuthNavigator';
import { AppNavigator } from '@/navigation/AppNavigator';
import { FirebaseSetupScreen } from '@/screens/Auth/FirebaseSetupScreen';
import { useAuth } from '@/store/AuthContext';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const navigationTheme = useAppTheme();
  const { configError, isAuthenticated, isLoading } = useAuth();

  if (configError) {
    return <FirebaseSetupScreen error={configError} />;
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
