import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firebaseConfigError, firebaseDb } from '@/services/firebase/config';
import { UserProfile, UserProfileForm } from '@/types/navigation';

function ensureDb() {
  if (!firebaseDb) {
    throw new Error(firebaseConfigError ?? 'Cloud Firestore is not configured.');
  }

  return firebaseDb;
}

function buildDefaultProfile(uid: string, email: string): UserProfile {
  return {
    uid,
    email,
    name: '',
    college: '',
    branch: '',
    year: '',
    role: 'Student',
  };
}

export async function getUserProfile(uid: string) {
  const profileRef = doc(ensureDb(), 'users', uid);
  const profileSnapshot = await getDoc(profileRef);

  if (!profileSnapshot.exists()) {
    return null;
  }

  return profileSnapshot.data() as UserProfile;
}

export async function ensureUserProfile(uid: string, email: string) {
  const existingProfile = await getUserProfile(uid);

  if (existingProfile) {
    return existingProfile;
  }

  const defaultProfile = buildDefaultProfile(uid, email);

  await setDoc(doc(ensureDb(), 'users', uid), {
    ...defaultProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return defaultProfile;
}

export async function saveUserProfile(uid: string, email: string, profile: UserProfileForm) {
  const nextProfile: UserProfile = {
    uid,
    email,
    ...profile,
  };

  await setDoc(
    doc(ensureDb(), 'users', uid),
    {
      ...nextProfile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return nextProfile;
}
