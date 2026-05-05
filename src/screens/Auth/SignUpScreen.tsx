import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/common/Screen';
import { useTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/store/AuthContext';
import { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp() {
    setLoading(true);
    setError(null);

    try {
      await signUp({ email, password });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Sign up with email and password to access the app.
        </Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          placeholder="Choose a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}

        <Button title="Create account" loading={loading} onPress={handleSignUp} />

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>
            Already have an account? Log in
          </Text>
        </Pressable>
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
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
