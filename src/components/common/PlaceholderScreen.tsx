import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useAppTheme';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
};

export function PlaceholderScreen({
  title,
  description,
  buttonLabel,
  onPress,
}: PlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <Screen>
      <Card style={styles.card}>
        <Text
          style={[
            styles.eyebrow,
            {
              color: theme.colors.primary,
              backgroundColor: theme.colors.primarySoft,
            },
          ]}
        >
          Nested Stack Screen
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {description}
        </Text>
        <Button title={buttonLabel} onPress={onPress} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
