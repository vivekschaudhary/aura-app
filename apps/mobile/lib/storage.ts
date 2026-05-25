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
  signedToken: 'aura.signedToken',
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

export async function getSignedToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.signedToken);
}

export async function setSignedToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.signedToken, token);
}

/** Wipe all on-device session data (sign-out / device-removal flow). */
export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.handle),
    SecureStore.deleteItemAsync(KEYS.signedToken),
    // Keep language: removing it would dump the user back to the picker on next launch.
  ]);
}
