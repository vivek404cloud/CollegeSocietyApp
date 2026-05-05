import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useAppTheme';
import { Society } from '@/types/society';

type SocietyCardProps = {
  society: Society;
  categoryName?: string;
  onPress?: () => void;
  compact?: boolean;
};

export function SocietyCard({ society, categoryName, onPress, compact = false }: SocietyCardProps) {
  const theme = useTheme();
  const imageSize = compact ? 56 : 64;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}>
      <Card style={compact ? styles.compactCard : undefined}>
        <View style={styles.header}>
          {society.logoUrl ? (
            <Image
              source={{ uri: society.logoUrl }}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 20,
              }}
            />
          ) : (
            <Avatar name={society.name} size={imageSize} />
          )}
          <View style={styles.headerContent}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {society.name}
            </Text>
            <Text
              style={[
                styles.meta,
                {
                  color: theme.colors.textMuted,
                },
              ]}
              numberOfLines={1}
            >
              {categoryName || 'Society'} · {society.memberCount} members
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeLabel,
                {
                  color: theme.colors.primary,
                },
              ]}
            >
              Trending {society.trendingScore}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textMuted,
            },
          ]}
          numberOfLines={compact ? 2 : 3}
        >
          {society.shortDescription || society.description}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    padding: 16,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
