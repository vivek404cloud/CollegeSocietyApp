import React, {
  PropsWithChildren,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User } from '@firebase/auth';

import { firebaseConfigError } from '@/services/firebase/config';
import {
  loginWithEmail,
  logoutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
} from '@/services/firebase/auth';
import { ensureUserProfile, saveUserProfile } from '@/services/firebase/profile';
import {
  AuthContextValue,
  AuthCredentials,
  UserProfile,
  UserProfileForm,
} from '@/types/navigation';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(firebaseConfigError);

  useEffect(() => {
    if (firebaseConfigError) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthChanges(async (nextUser) => {
      setUser(nextUser);

      if (!nextUser?.uid || !nextUser.email) {
        setProfile(null);
        setSetupError(null);
        setIsLoading(false);
        return;
      }

      try {
        const ensuredProfile = await ensureUserProfile(nextUser.uid, nextUser.email);
        setProfile(ensuredProfile);
        setSetupError(null);
      } catch (error) {
        setProfile(null);
        setSetupError(
          error instanceof Error ? error.message : 'Unable to load your profile from Firestore.',
        );
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    await loginWithEmail(credentials);
  }, []);

  const signUp = useCallback(async (credentials: AuthCredentials) => {
    await signUpWithEmail(credentials);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.uid || !user.email) {
      setProfile(null);
      return;
    }

    const nextProfile = await ensureUserProfile(user.uid, user.email);
    setProfile(nextProfile);
  }, [user?.email, user?.uid]);

  const updateProfile = useCallback(
    async (nextProfile: UserProfileForm) => {
      if (!user?.uid || !user.email) {
        throw new Error('You must be signed in to update your profile.');
      }

      const savedProfile = await saveUserProfile(user.uid, user.email, nextProfile);
      setProfile(savedProfile);
    },
    [user?.email, user?.uid],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      configError: setupError,
      login,
      signUp,
      logout,
      updateProfile,
      refreshProfile,
    }),
    [isLoading, login, logout, profile, refreshProfile, setupError, signUp, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
