import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/common/Screen';
import { useTheme } from '@/hooks/useAppTheme';

type FirebaseSetupScreenProps = {
  error: string;
};

export function FirebaseSetupScreen({ error }: FirebaseSetupScreenProps) {
  const theme = useTheme();

  return (
    <Screen>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Firebase Setup Required</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Add your Firebase web app credentials as `EXPO_PUBLIC_FIREBASE_*` environment variables,
          then restart Expo.
        </Text>
        <View style={[styles.callout, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[styles.code, { color: theme.colors.text }]}>{error}</Text>
        </View>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          In the Firebase console, create a project, add a Web app, enable Email/Password in
          Authentication, create a Cloud Firestore database, then copy the config values into your
          local environment.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
  callout: {
    borderRadius: 16,
    padding: 16,
  },
  code: {
    fontSize: 13,
    lineHeight: 20,
  },
});
