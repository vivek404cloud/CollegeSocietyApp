import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useTheme } from '@/hooks/useAppTheme';
import { CreateStackNavigator } from '@/navigation/stacks/CreateStackNavigator';
import { ExploreStackNavigator } from '@/navigation/stacks/ExploreStackNavigator';
import { HomeStackNavigator } from '@/navigation/stacks/HomeStackNavigator';
import { ProfileStackNavigator } from '@/navigation/stacks/ProfileStackNavigator';
import { RootTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  const theme = useTheme();

  function getTabIcon(routeName: keyof RootTabParamList, focused: boolean) {
    switch (routeName) {
      case 'HomeTab':
        return focused ? 'home' : 'home-outline';
      case 'ExploreTab':
        return focused ? 'compass' : 'compass-outline';
      case 'CreateTab':
        return focused ? 'add-circle' : 'add-circle-outline';
      case 'ProfileTab':
        return focused ? 'person-circle' : 'person-circle-outline';
      default:
        return 'ellipse-outline';
    }
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={getTabIcon(route.name, focused)} size={size + 1} color={color} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackNavigator}
        options={{ title: 'Explore' }}
      />
      <Tab.Screen name="CreateTab" component={CreateStackNavigator} options={{ title: 'Create' }} />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
