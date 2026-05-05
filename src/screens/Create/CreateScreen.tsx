import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/components/common/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useAppTheme';
import {
  createSociety,
  getSocietyById,
  listCategories,
  updateSociety,
  uploadSocietyLogo,
} from '@/services/firebase/societies';
import { useAuth } from '@/store/AuthContext';
import { CreateStackParamList } from '@/types/navigation';
import { Category, SocialPlatform, Society } from '@/types/society';

type Props = NativeStackScreenProps<CreateStackParamList, 'CreateMain'>;

type SocialFormState = Record<SocialPlatform, string>;

const initialSocials: SocialFormState = {
  instagram: '',
  linkedin: '',
  website: '',
  youtube: '',
  x: '',
  discord: '',
};

function buildSocialLinks(values: SocialFormState) {
  return (Object.entries(values) as [SocialPlatform, string][])
    .filter(([, url]) => url.trim())
    .map(([platform, url]) => ({
      platform,
      url: url.trim(),
    }));
}

export function CreateScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { profile } = useAuth();
  const societyId = route.params?.societyId;
  const isEditing = Boolean(societyId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [existingSociety, setExistingSociety] = useState<Society | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [socials, setSocials] = useState<SocialFormState>(initialSocials);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryName = useMemo(
    () => categories.find((item) => item.id === categoryId)?.name ?? 'Choose a category',
    [categories, categoryId],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadScreenData() {
      try {
        setError(null);

        const [nextCategories, editableSociety] = await Promise.all([
          listCategories(),
          societyId ? getSocietyById(societyId) : Promise.resolve(null),
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(nextCategories);

        if (editableSociety) {
          setExistingSociety(editableSociety);
          setName(editableSociety.name);
          setDescription(editableSociety.description);
          setCategoryId(editableSociety.categoryId);
          setLogoUri(editableSociety.logoUrl);
          setSocials({
            instagram:
              editableSociety.socialLinks.find((item) => item.platform === 'instagram')?.url ?? '',
            linkedin:
              editableSociety.socialLinks.find((item) => item.platform === 'linkedin')?.url ?? '',
            website:
              editableSociety.socialLinks.find((item) => item.platform === 'website')?.url ?? '',
            youtube:
              editableSociety.socialLinks.find((item) => item.platform === 'youtube')?.url ?? '',
            x: editableSociety.socialLinks.find((item) => item.platform === 'x')?.url ?? '',
            discord:
              editableSociety.socialLinks.find((item) => item.platform === 'discord')?.url ?? '',
          });
        } else if (nextCategories.length > 0) {
          setCategoryId((current) => current || nextCategories[0].id);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Unable to load the Create Society form.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadScreenData();

    return () => {
      isMounted = false;
    };
  }, [societyId]);

  async function handlePickImage() {
    try {
      setIsPickingImage(true);
      setError(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError('Media library access is required to upload a logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0]?.uri ?? null);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to pick an image.');
    } finally {
      setIsPickingImage(false);
    }
  }

  async function handleSubmit() {
    if (!profile?.uid || !profile.email) {
      setError('You need to be signed in before creating a society.');
      return;
    }

    if (!name.trim() || !description.trim() || !categoryId) {
      setError('Please fill in the name, description, and category.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let nextLogoUrl = existingSociety?.logoUrl ?? null;
      let nextLogoPath = existingSociety?.logoPath ?? null;

      if (logoUri && logoUri !== existingSociety?.logoUrl) {
        const uploadResult = await uploadSocietyLogo(profile.uid, logoUri);
        nextLogoUrl = uploadResult.downloadUrl;
        nextLogoPath = uploadResult.storagePath;
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryId,
        logoUrl: nextLogoUrl,
        logoPath: nextLogoPath,
        bannerUrl: existingSociety?.bannerUrl ?? null,
        socialLinks: buildSocialLinks(socials),
        status: 'active' as const,
        foundedYear: existingSociety?.foundedYear ?? null,
        contactEmail: profile.email,
        shortName: existingSociety?.shortName ?? '',
        shortDescription: existingSociety?.shortDescription ?? '',
        createdBy: existingSociety?.createdBy ?? profile.uid,
      };

      let nextSocietyId = societyId;

      if (societyId) {
        await updateSociety(societyId, payload);
      } else {
        nextSocietyId = await createSociety(payload, {
          uid: profile.uid,
          email: profile.email,
          name: profile.name,
        });
      }

      Alert.alert(
        isEditing ? 'Society updated' : 'Society created',
        isEditing
          ? 'Your changes have been saved.'
          : 'Your society is now live in the marketplace.',
      );

      if (nextSocietyId) {
        navigation.getParent()?.navigate('ExploreTab', {
          screen: 'ExploreDetails',
          params: { societyId: nextSocietyId },
        } as never);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save the society.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>
            {isEditing ? 'Edit Society' : 'Launch a new society'}
          </Text>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            Create a society page that students can discover, follow, and join.
          </Text>
          <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>
            Add the essentials first: identity, category, logo, and the social links students will
            use to connect.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Identity</Text>
          </View>
          <Input
            label="Society Name"
            placeholder="Enter society name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Description"
            placeholder="Describe your society, goals, and vibe"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.multilineInput}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category</Text>
          </View>
          <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
            Selected: {selectedCategoryName}
          </Text>
          <View style={styles.chipWrap}>
            {categories.map((item) => {
              const isSelected = item.id === categoryId;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCategoryId(item.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.inputBackground,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={(item.icon as keyof typeof Ionicons.glyphMap) || 'pricetag-outline'}
                    size={15}
                    color={isSelected ? theme.colors.white : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: isSelected ? theme.colors.white : theme.colors.text,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Logo</Text>
          </View>
          <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
            Use a square image for the cleanest card and marketplace presentation.
          </Text>

          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          ) : (
            <View
              style={[
                styles.logoPlaceholder,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.logoPlaceholderText, { color: theme.colors.textMuted }]}>
                No logo selected yet
              </Text>
            </View>
          )}

          <Button
            title={isPickingImage ? 'Opening Library...' : 'Choose Logo'}
            onPress={handlePickImage}
            variant="secondary"
            loading={isPickingImage}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="share-social-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Social Links</Text>
          </View>
          <Input
            label="Instagram"
            placeholder="https://instagram.com/your-society"
            value={socials.instagram}
            onChangeText={(value) => setSocials((current) => ({ ...current, instagram: value }))}
            autoCapitalize="none"
          />
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/company/your-society"
            value={socials.linkedin}
            onChangeText={(value) => setSocials((current) => ({ ...current, linkedin: value }))}
            autoCapitalize="none"
          />
          <Input
            label="Website"
            placeholder="https://your-society.example"
            value={socials.website}
            onChangeText={(value) => setSocials((current) => ({ ...current, website: value }))}
            autoCapitalize="none"
          />
          <Input
            label="YouTube"
            placeholder="https://youtube.com/@your-society"
            value={socials.youtube}
            onChangeText={(value) => setSocials((current) => ({ ...current, youtube: value }))}
            autoCapitalize="none"
          />
          <Input
            label="X / Twitter"
            placeholder="https://x.com/your-society"
            value={socials.x}
            onChangeText={(value) => setSocials((current) => ({ ...current, x: value }))}
            autoCapitalize="none"
          />
          <Input
            label="Discord"
            placeholder="https://discord.gg/your-society"
            value={socials.discord}
            onChangeText={(value) => setSocials((current) => ({ ...current, discord: value }))}
            autoCapitalize="none"
          />
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            title={isLoading ? 'Loading...' : isEditing ? 'Save Changes' : 'Create Society'}
            onPress={handleSubmit}
            loading={isSaving || isLoading}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 22,
    paddingBottom: 36,
  },
  heroBlock: {
    gap: 10,
    paddingTop: 4,
  },
  section: {
    gap: 14,
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
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  categoryChipText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: 28,
    alignSelf: 'center',
  },
  logoPlaceholder: {
    height: 120,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    paddingBottom: 12,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 16,
  },
});
