/**
 * Mobile passkey client wrapper.
 *
 * Wraps `react-native-passkey` so the screens don't deal with native APIs
 * directly. Detects device capability synchronously on mount; on enrollment
 * calls into the server-side WebAuthn ceremony (via tRPC in PR 2).
 *
 * Private key never leaves the device — the OS keychain (iCloud Keychain /
 * Google Password Manager) holds it per architecture § Auth decision.
 */

import { Passkey, type PasskeyCreateRequest, type PasskeyCreateResult } from 'react-native-passkey';

/**
 * Detect whether this device can create passkeys.
 * Returns false on devices without biometric capability or without Credential
 * Manager support (older Android / non-Touch-ID iOS), routing those users to
 * the Not Supported screen per design.md.
 */
export function isPasskeySupported(): boolean {
  try {
    return Passkey.isSupported();
  } catch {
    return false;
  }
}

/**
 * Run the device-side WebAuthn ceremony.
 * The challenge comes from the server (`auth.passkey.beginEnrollment`); this
 * function passes it to the OS keychain, which prompts the user for biometric
 * confirmation, then returns the signed attestation for the server to verify
 * (`auth.passkey.finishEnrollment`).
 *
 * Errors:
 *   - User cancels biometric prompt → throws (caught by the screen, shown as
 *     `passkey.error.cancelled`).
 *   - Network / OS error → throws (caught by the screen, shown as
 *     `passkey.error.network`).
 */
export async function createPasskey(
  challenge: PasskeyCreateRequest,
): Promise<PasskeyCreateResult> {
  return Passkey.create(challenge);
}
