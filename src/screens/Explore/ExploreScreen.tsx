import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/components/common/Screen';
import { SocietyCard } from '@/components/societies/SocietyCard';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useAppTheme';
import {
  getSocietyMarketplaceData,
  listSocietiesPage,
  SocietyPage,
} from '@/services/firebase/societies';
import { ExploreStackParamList } from '@/types/navigation';
import { Category, Society } from '@/types/society';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

export function ExploreScreen({ navigation }: Props) {
  const theme = useTheme();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [trendingSocieties, setTrendingSocieties] = useState<Society[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [queryText, setQueryText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [pageState, setPageState] = useState<Pick<SocietyPage, 'cursor' | 'hasMore'>>({
    cursor: null,
    hasMore: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deferredQueryText = useDeferredValue(queryText);
  const categoryMap = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  const loadMarketplace = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const data = await getSocietyMarketplaceData({
          searchTerm: deferredQueryText,
          categoryId: selectedCategoryId,
        });

        setCategories(data.categories);
        setTrendingSocieties(data.trendingSocieties);
        setSocieties(data.societies);
        setPageState({
          cursor: data.cursor,
          hasMore: data.hasMore,
        });
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Unable to load societies.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [deferredQueryText, selectedCategoryId],
  );

  useEffect(() => {
    void loadMarketplace();
  }, [loadMarketplace]);

  async function loadMore() {
    if (!pageState.hasMore || !pageState.cursor || isLoadingMore || isLoading) {
      return;
    }

    try {
      setIsLoadingMore(true);

      const nextPage = await listSocietiesPage({
        searchTerm: deferredQueryText,
        categoryId: selectedCategoryId,
        cursor: pageState.cursor,
      });

      setSocieties((current) => [...current, ...nextPage.items]);
      setPageState({
        cursor: nextPage.cursor,
        hasMore: nextPage.hasMore,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load more societies.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  function openSociety(societyId: string) {
    navigation.navigate('ExploreDetails', { societyId });
  }

  function renderSociety({ item }: ListRenderItemInfo<Society>) {
    return (
      <SocietyCard
        society={item}
        categoryName={categoryMap.get(item.categoryId)}
        onPress={() => openSociety(item.id)}
      />
    );
  }

  return (
    <Screen>
      <FlatList
        data={societies}
        keyExtractor={(item) => item.id}
        renderItem={renderSociety}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.heroBlock}>
              <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Marketplace</Text>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
                Discover campus societies with momentum.
              </Text>
              <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>
                Search by name, filter by category, and explore the groups students are engaging
                with right now.
              </Text>
            </View>

            <Input
              label="Search societies"
              placeholder="Type a society name"
              value={queryText}
              onChangeText={setQueryText}
            />

            <View style={styles.filterRow}>
              <Pressable
                onPress={() => setSelectedCategoryId(null)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedCategoryId === null
                        ? theme.colors.primary
                        : theme.colors.inputBackground,
                    borderColor:
                      selectedCategoryId === null ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="apps-outline"
                  size={15}
                  color={selectedCategoryId === null ? theme.colors.white : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: selectedCategoryId === null ? theme.colors.white : theme.colors.text,
                    },
                  ]}
                >
                  All
                </Text>
              </Pressable>
              {categories.map((item) => {
                const isActive = selectedCategoryId === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedCategoryId(item.id)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? theme.colors.primary
                          : theme.colors.inputBackground,
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={(item.icon as keyof typeof Ionicons.glyphMap) || 'pricetag-outline'}
                      size={15}
                      color={isActive ? theme.colors.white : theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.filterLabel,
                        {
                          color: isActive ? theme.colors.white : theme.colors.text,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flame-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Trending now
                </Text>
              </View>
              <Text style={[styles.sectionMeta, { color: theme.colors.textMuted }]}>
                Student interest + member growth
              </Text>
            </View>

            <FlatList
              horizontal
              data={trendingSocieties}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingList}
              renderItem={({ item }) => (
                <View style={styles.trendingCard}>
                  <SocietyCard
                    society={item}
                    categoryName={categoryMap.get(item.categoryId)}
                    compact
                    onPress={() => openSociety(item.id)}
                  />
                </View>
              )}
            />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="compass-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  All societies
                </Text>
              </View>
              <Text style={[styles.sectionMeta, { color: theme.colors.textMuted }]}>
                {societies.length} loaded
              </Text>
            </View>

            {error ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stateBlock}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <View style={styles.stateBlock}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No societies matched this view.
              </Text>
              <Text style={[styles.emptyBody, { color: theme.colors.textMuted }]}>
                Try a different search term or switch back to all categories.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.45}
        initialNumToRender={6}
        windowSize={6}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadMarketplace(true)}
            tintColor={theme.colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 18,
    marginBottom: 16,
  },
  heroBlock: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  filterLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  sectionMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  trendingList: {
    gap: 12,
    paddingRight: 12,
  },
  trendingCard: {
    width: 300,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  stateBlock: {
    paddingVertical: 28,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
