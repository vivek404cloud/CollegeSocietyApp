import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/hooks/useAppTheme';

type InputProps = TextInputProps & {
  label: string;
};

export function Input({ label, ...props }: InputProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.placeholder}
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
          },
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
});
