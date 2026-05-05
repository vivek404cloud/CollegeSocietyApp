import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useAppTheme';

type InfoCardProps = {
  label: string;
  value: string;
};

export function InfoCard({ label, value }: InfoCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
});
