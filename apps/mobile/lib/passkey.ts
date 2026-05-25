/**
 * Mobile passkey client wrapper.
 *
 * Wraps `react-native-passkey` so the screens don't deal with native APIs
 * directly. Detects device capability synchronously on mount; on enrollment
 * relays the server-issued challenge (via tRPC) into the OS keychain.
 *
 * Private key never leaves the device — the OS keychain (iCloud Keychain /
 * Google Password Manager) holds it per architecture § Auth decision.
 *
 * Type-tolerant on purpose: @simplewebauthn/server returns
 * `PublicKeyCredentialCreationOptionsJSON`, react-native-passkey expects a
 * shape that's WebAuthn-spec-equivalent but its type names differ between
 * minor versions. The runtime shape is what matters (both follow the spec);
 * the API boundary uses `unknown` so a version bump can't TS-break callers.
 * See R-S1-4 in AUR-5 story DRI.
 */

import { Passkey } from 'react-native-passkey';

export function isPasskeySupported(): boolean {
  try {
    return Passkey.isSupported();
  } catch {
    return false;
  }
}

/**
 * Run the device-side WebAuthn ceremony.
 *
 *   - User cancels biometric prompt → throws (caught by the screen, shown as
 *     `passkey.error.cancelled`).
 *   - Network / OS error → throws (caught by the screen, shown as
 *     `passkey.error.network`).
 */
export async function createPasskey(options: unknown): Promise<unknown> {
  return (Passkey as unknown as {
    create: (o: unknown) => Promise<unknown>;
  }).create(options);
}
