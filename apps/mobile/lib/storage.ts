/**
 * Secure on-device storage helpers — wraps `expo-secure-store` (OS keychain).
 *
 * Stores: chosen language, handle, signed-handle token from server.
 * Private passkey material NEVER touches this layer — passkeys live in the
 * platform credential manager (iCloud Keychain / Google Password Manager) per
 * architecture § Auth.
 */

import * as SecureStore from 'expo-secure-store';
import type { Language } from '@aura/core';

const KEYS = {
  language: 'aura.language',
  handle: 'aura.handle',
  userId: 'aura.userId',
  signedToken: 'aura.signedToken',
  /**
   * Sticky flag — set when the user lands on /onboarding/not-supported so the
   * root guard short-circuits there on subsequent cold launches instead of
   * walking them back through onboarding only to fail again at the passkey
   * step. Cleared on reinstall (expo-secure-store wipes with the app). Per
   * Codex P1 review of PR #1 (`apps/mobile/app/_layout.tsx:24-29`).
   */
  onboardingTerminated: 'aura.onboardingTerminated',
} as const;

export async function getLanguage(): Promise<Language | null> {
  const v = await SecureStore.getItemAsync(KEYS.language);
  return v === 'en' || v === 'hi' ? v : null;
}

export async function setLanguage(language: Language): Promise<void> {
  await SecureStore.setItemAsync(KEYS.language, language);
}

export async function getHandle(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.handle);
}

export async function setHandle(handle: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.handle, handle);
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.userId);
}

export async function setUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.userId, userId);
}

export async function getSignedToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.signedToken);
}

export async function setSignedToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.signedToken, token);
}

export async function getOnboardingTerminated(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEYS.onboardingTerminated);
  return v === '1';
}

export async function setOnboardingTerminated(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.onboardingTerminated, '1');
}

export async function clearOnboardingTerminated(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.onboardingTerminated);
}

/** Wipe all on-device session data (sign-out / device-removal flow). */
export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.handle),
    SecureStore.deleteItemAsync(KEYS.userId),
    SecureStore.deleteItemAsync(KEYS.signedToken),
    SecureStore.deleteItemAsync(KEYS.onboardingTerminated),
    // Keep language: removing it would dump the user back to the picker on next launch.
  ]);
}
