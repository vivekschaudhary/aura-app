/**
 * MSG91 SMS OTP — recovery / device-capability fallback for the ~5–15% of users
 * without passkey-capable devices or cross-device sync. Per architecture R-AUTH-V2.
 *
 * Only invoked on the fallback path. Per-OTP cost ≈ ₹0.15 — negligible at our scale
 * because the path is rare (instrument fallback-path usage monthly; if > 20% of
 * new users land here, revisit per R-AUTH-V2 mitigation).
 */

import type { Result } from '@aura/core';

export interface OtpSendInput {
  phoneE164: string; // +91XXXXXXXXXX
  purpose: 'recovery' | 'first_login_no_biometric';
}

export interface OtpVerifyInput {
  phoneE164: string;
  code: string;
}

export async function sendOtp(_input: OtpSendInput): Promise<Result<{ requestId: string }>> {
  return {
    ok: false,
    error: new Error('TODO: wire MSG91 Send OTP API — feature bet'),
  };
}

export async function verifyOtp(_input: OtpVerifyInput): Promise<Result<{ verified: boolean }>> {
  return {
    ok: false,
    error: new Error('TODO: wire MSG91 Verify OTP API — feature bet'),
  };
}
