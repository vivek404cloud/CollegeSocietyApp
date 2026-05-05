import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/components/common/Screen';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useAppTheme';
import {
  formatTimestamp,
  getSocietyDetailData,
  joinSociety,
  SocietyDetailData,
  toggleFollowSociety,
} from '@/services/firebase/societies';
import { useAuth } from '@/store/AuthContext';
import { ExploreStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreDetails'>;

export function ExploreDetailsScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { profile } = useAuth();
  const { societyId } = route.params;

  const [detail, setDetail] = useState<SocietyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isFollowingAction, setIsFollowingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const nextDetail = await getSocietyDetailData(societyId, profile?.uid);
      setDetail(nextDetail);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load society details.');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.uid, societyId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function handleJoin() {
    if (!profile?.uid || !profile.email) {
      setError('Sign in to join this society.');
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      await joinSociety(societyId, {
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
      });
      await loadDetail();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to join the society.');
    } finally {
      setIsJoining(false);
    }
  }

  async function handleFollow() {
    if (!profile?.uid || !detail) {
      setError('Sign in to follow this society.');
      return;
    }

    try {
      setIsFollowingAction(true);
      setError(null);
      await toggleFollowSociety(societyId, profile.uid, detail.isFollowing);
      await loadDetail();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to update follow state.');
    } finally {
      setIsFollowingAction(false);
    }
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen style={styles.centered}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Society not found.</Text>
        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.heroPanel,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.heroAccent,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          />

          <View style={styles.heroHeader}>
            {detail.society.logoUrl ? (
              <Image source={{ uri: detail.society.logoUrl }} style={styles.logo} />
            ) : (
              <View
                style={[
                  styles.logoFallback,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.logoInitials, { color: theme.colors.primary }]}>
                  {detail.society.shortName || detail.society.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
                {detail.society.name}
              </Text>
              <Text style={[styles.heroMeta, { color: theme.colors.textMuted }]}>
                {detail.category?.name ?? 'Society'} · {detail.society.memberCount} members ·{' '}
                {detail.society.followerCount} followers
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: theme.colors.textMuted }]}>
            {detail.society.description}
          </Text>

          <View style={styles.actionRow}>
            <Button
              title={detail.currentMembership ? 'Joined' : 'Join Society'}
              onPress={handleJoin}
              loading={isJoining}
            />
            <Button
              title={detail.isFollowing ? 'Following' : 'Follow'}
              onPress={handleFollow}
              variant="secondary"
              loading={isFollowingAction}
            />
          </View>

          {detail.canEdit ? (
            <Button
              title="Edit Society"
              onPress={() =>
                navigation.getParent()?.navigate('CreateTab', {
                  screen: 'CreateMain',
                  params: { societyId },
                } as never)
              }
              variant="ghost"
            />
          ) : null}
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Full info</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Status</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {detail.society.status}
              </Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Contact</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {detail.society.contactEmail || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="share-social-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Social links</Text>
          </View>

          {detail.society.socialLinks.length === 0 ? (
            <Text style={[styles.emptyBody, { color: theme.colors.textMuted }]}>
              No social links added yet.
            </Text>
          ) : (
            <View style={styles.socialList}>
              {detail.society.socialLinks.map((link) => (
                <Text
                  key={`${link.platform}-${link.url}`}
                  style={[styles.linkText, { color: theme.colors.primary }]}
                  onPress={() => void Linking.openURL(link.url)}
                >
                  {link.platform}: {link.url}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Members</Text>
          </View>

          {detail.members.length === 0 ? (
            <Text style={[styles.emptyBody, { color: theme.colors.textMuted }]}>
              No members have joined yet.
            </Text>
          ) : (
            <View style={styles.listSection}>
              {detail.members.map((member) => (
                <View
                  key={member.id}
                  style={[
                    styles.listRow,
                    {
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.memberMeta}>
                    <Text style={[styles.memberName, { color: theme.colors.text }]}>
                      {member.userName}
                    </Text>
                    <Text style={[styles.memberDetail, { color: theme.colors.textMuted }]}>
                      {member.userEmail}
                    </Text>
                  </View>
                  <Text style={[styles.memberDetail, { color: theme.colors.textMuted }]}>
                    Joined {formatTimestamp(member.joinedAt)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Events</Text>
          </View>

          {detail.events.length === 0 ? (
            <Text style={[styles.emptyBody, { color: theme.colors.textMuted }]}>
              No upcoming events have been published yet.
            </Text>
          ) : (
            <View style={styles.listSection}>
              {detail.events.map((event) => (
                <View
                  key={event.id}
                  style={[
                    styles.eventCard,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventMeta, { color: theme.colors.textMuted }]}>
                    {formatTimestamp(event.startAt)} · {event.venue || 'Venue TBA'}
                  </Text>
                  <Text style={[styles.eventBody, { color: theme.colors.textMuted }]}>
                    {event.description}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 20,
    paddingBottom: 36,
  },
  heroPanel: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  heroAccent: {
    position: 'absolute',
    top: -36,
    right: -18,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  heroMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
  },
  logoFallback: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 12,
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
  infoGrid: {
    gap: 12,
  },
  infoBlock: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  socialList: {
    gap: 10,
  },
  linkText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  listSection: {
    gap: 8,
  },
  listRow: {
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  memberMeta: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  memberDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  eventCard: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  eventTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  eventMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  eventBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
