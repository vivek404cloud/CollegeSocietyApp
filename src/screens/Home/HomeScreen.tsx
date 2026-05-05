import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/components/common/Screen';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useAppTheme';
import { HomeStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const metrics = [
  { label: 'Upcoming events', value: '12', icon: 'calendar-outline' },
  { label: 'Open societies', value: '36', icon: 'compass-outline' },
  { label: 'New members', value: '248', icon: 'people-outline' },
] as const;

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Campus pulse</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Keep student communities easy to discover and easy to run.
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Browse societies, publish activity, and help members find the right circle faster.
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Button title="Open marketplace" onPress={() => navigation.navigate('HomeDetails')} />
          <Button
            title="Create society"
            variant="secondary"
            onPress={() => navigation.navigate('HomeDetails')}
          />
        </View>

        <View style={styles.metricList}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={[
                styles.metricRow,
                {
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.metricIcon,
                  {
                    backgroundColor: theme.colors.primarySoft,
                  },
                ]}
              >
                <Ionicons name={metric.icon} size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.metricText}>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>
                  {metric.label}
                </Text>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {metric.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 22,
    paddingBottom: 32,
  },
  heroBlock: {
    gap: 8,
    paddingTop: 4,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsRow: {
    gap: 12,
  },
  metricList: {
    gap: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricText: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  metricValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
});
