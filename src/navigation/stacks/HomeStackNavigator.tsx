import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeDetailsScreen } from '@/screens/Home/HomeDetailsScreen';
import { HomeScreen } from '@/screens/Home/HomeScreen';
import { HomeStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen
        name="HomeDetails"
        component={HomeDetailsScreen}
        options={{ title: 'Home Details' }}
      />
    </Stack.Navigator>
  );
}
