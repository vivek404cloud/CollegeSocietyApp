import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileDetailsScreen } from '@/screens/Profile/ProfileDetailsScreen';
import { ProfileScreen } from '@/screens/Profile/ProfileScreen';
import { ProfileStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen
        name="ProfileDetails"
        component={ProfileDetailsScreen}
        options={{ title: 'Profile Details' }}
      />
    </Stack.Navigator>
  );
}
