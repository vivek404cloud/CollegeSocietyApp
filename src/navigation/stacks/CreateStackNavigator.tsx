import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateScreen } from '@/screens/Create/CreateScreen';
import { CreateStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<CreateStackParamList>();

export function CreateStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CreateMain"
        component={CreateScreen}
        options={{ title: 'Create Society' }}
      />
    </Stack.Navigator>
  );
}
