import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ExploreDetailsScreen } from '@/screens/Explore/ExploreDetailsScreen';
import { ExploreScreen } from '@/screens/Explore/ExploreScreen';
import { ExploreStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreMain"
        component={ExploreScreen}
        options={{ title: 'Society Marketplace' }}
      />
      <Stack.Screen
        name="ExploreDetails"
        component={ExploreDetailsScreen}
        options={{ title: 'Society Details' }}
      />
    </Stack.Navigator>
  );
}
