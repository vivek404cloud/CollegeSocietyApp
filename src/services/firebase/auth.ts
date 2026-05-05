import {
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@firebase/auth';

import { AuthCredentials } from '@/types/navigation';
import { firebaseAuth, firebaseConfigError } from '@/services/firebase/config';

function ensureAuth() {
  if (!firebaseAuth) {
    throw new Error(firebaseConfigError ?? 'Firebase Authentication is not configured.');
  }

  return firebaseAuth;
}

export function subscribeToAuthChanges(callback: Parameters<typeof onAuthStateChanged>[1]) {
  return onAuthStateChanged(ensureAuth(), callback);
}

export async function loginWithEmail({
  email,
  password,
}: AuthCredentials): Promise<UserCredential> {
  return signInWithEmailAndPassword(ensureAuth(), email.trim(), password);
}

export async function signUpWithEmail({
  email,
  password,
}: AuthCredentials): Promise<UserCredential> {
  return createUserWithEmailAndPassword(ensureAuth(), email.trim(), password);
}

export async function logoutUser() {
  return signOut(ensureAuth());
}
