import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useAppTheme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading = false }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary
            ? theme.colors.primary
            : isGhost
              ? 'transparent'
              : theme.colors.primarySoft,
          borderColor: isGhost ? 'transparent' : theme.colors.border,
          opacity: pressed || loading ? 0.88 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.white : theme.colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: isPrimary ? theme.colors.white : theme.colors.primary,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
