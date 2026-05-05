import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/common/Screen';
import { useTheme } from '@/hooks/useAppTheme';

type DetailCardProps = {
  title: string;
  description: string;
};

export function DetailCard({ title, description }: DetailCardProps) {
  const theme = useTheme();

  return (
    <Screen>
      <Card style={styles.card}>
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
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
