// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export const firebaseEnabled = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

export const app: FirebaseApp | null = !firebaseEnabled
  ? null
  : getApps()[0] ||
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    });

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

export async function ensureAnonAuth(): Promise<string | null> {
  if (!auth) return null;
  try {
    await signInAnonymously(auth);
  } catch {/* ignore */}
  return new Promise<string | null>((resolve) => {
    onAuthStateChanged(auth, (u) => resolve(u?.uid ?? null));
  });
}
