import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/components/common/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/store/AuthContext';
import { ProfileStackParamList, UserProfileForm, UserRole } from '@/types/navigation';
import { validateProfile } from '@/utils/profileValidation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen({ navigation }: Props) {
  const theme = useTheme();
  const { logout, profile, updateProfile, user } = useAuth();
  const [form, setForm] = useState<UserProfileForm>({
    name: '',
    college: '',
    branch: '',
    year: '',
    role: 'Student',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfileForm, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      name: profile.name,
      college: profile.college,
      branch: profile.branch,
      year: profile.year,
      role: profile.role,
    });
  }, [profile]);

  const roleOptions = useMemo<UserRole[]>(() => ['Student', 'Admin'], []);

  function updateField<Key extends keyof UserProfileForm>(key: Key, value: UserProfileForm[Key]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [key]: undefined,
    }));
    setSaveMessage(null);
  }

  async function handleSave() {
    const validationErrors = validateProfile(form);
    setErrors(validationErrors);
    setSaveMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        ...form,
        name: form.name.trim(),
        college: form.college.trim(),
        branch: form.branch.trim(),
        year: form.year.trim(),
      });
      setSaveMessage('Profile updated successfully.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Avatar name={profile?.name || user?.email || 'Member'} size={68} />
          <View style={styles.heroText}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Your profile</Text>
            <Text style={[styles.email, { color: theme.colors.textMuted }]}>
              {user?.email ?? 'Signed-in user'}
            </Text>
          </View>
        </View>

        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Keep your member profile complete so society coordinators can recognize you quickly.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile details</Text>
          </View>

          <Input
            label="Name"
            placeholder="Enter your full name"
            value={form.name}
            onChangeText={(value) => updateField('name', value)}
          />
          {errors.name ? (
            <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.name}</Text>
          ) : null}

          <Input
            label="College"
            placeholder="Enter your college name"
            value={form.college}
            onChangeText={(value) => updateField('college', value)}
          />
          {errors.college ? (
            <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.college}</Text>
          ) : null}

          <Input
            label="Branch"
            placeholder="Computer Science"
            value={form.branch}
            onChangeText={(value) => updateField('branch', value)}
          />
          {errors.branch ? (
            <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.branch}</Text>
          ) : null}

          <Input
            label="Year"
            placeholder="1"
            keyboardType="number-pad"
            value={form.year}
            onChangeText={(value) => updateField('year', value)}
          />
          {errors.year ? (
            <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.year}</Text>
          ) : null}

          <View style={styles.roleSection}>
            <Text style={[styles.roleLabel, { color: theme.colors.text }]}>Role</Text>
            <View style={styles.roleOptions}>
              {roleOptions.map((role) => {
                const isActive = form.role === role;

                return (
                  <Text
                    key={role}
                    onPress={() => updateField('role', role)}
                    style={[
                      styles.roleChip,
                      {
                        color: isActive ? theme.colors.white : theme.colors.text,
                        backgroundColor: isActive
                          ? theme.colors.primary
                          : theme.colors.inputBackground,
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    {role}
                  </Text>
                );
              })}
            </View>
            {errors.role ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.role}</Text>
            ) : null}
          </View>

          {saveMessage ? (
            <Text
              style={[
                styles.message,
                {
                  color: saveMessage.includes('successfully')
                    ? theme.colors.success
                    : theme.colors.danger,
                },
              ]}
            >
              {saveMessage}
            </Text>
          ) : null}

          <Button title="Update Profile" loading={isSaving} onPress={handleSave} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account actions</Text>
          </View>
          <Button
            title="Open Profile Details"
            onPress={() => navigation.navigate('ProfileDetails')}
          />
          <Button title="Logout" variant="secondary" onPress={logout} />
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  email: {
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  roleSection: {
    gap: 10,
  },
  roleLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    overflow: 'hidden',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
