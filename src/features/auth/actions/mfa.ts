'use server';

import { createSessionClient } from '@/lib/appwrite/server';
import { safeError } from '@/lib/safe-error';
import { AuthenticatorType, AuthenticationFactor } from 'node-appwrite';

// ─── Setup: Create TOTP authenticator (returns secret + otpauth URI) ─────────
export async function createTotpAuthenticatorAction() {
  try {
    const { account } = await createSessionClient();
    const result = await account.createMFAAuthenticator({
      type: AuthenticatorType.Totp
    });
    // result: { secret: string, uri: string }
    return { secret: result.secret, uri: result.uri, error: null };
  } catch (err) {
    return { secret: null, uri: null, error: safeError(err, 'Failed to create authenticator') };
  }
}

// ─── Setup: Verify TOTP code to finalize authenticator registration ──────────
export async function verifyTotpAuthenticatorAction(otp: string) {
  try {
    const { account } = await createSessionClient();
    // Verify the authenticator with the OTP from the user's app
    await account.updateMFAAuthenticator({
      type: AuthenticatorType.Totp,
      otp
    });
    // Enable MFA on the account
    await account.updateMFA({ mfa: true });
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: safeError(err, 'Invalid verification code') };
  }
}

// ─── Disable: Remove TOTP authenticator and turn off MFA ─────────────────────
export async function disableTotpAuthenticatorAction() {
  try {
    const { account } = await createSessionClient();
    await account.deleteMFAAuthenticator({ type: AuthenticatorType.Totp });
    await account.updateMFA({ mfa: false });
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: safeError(err, 'Failed to disable authenticator') };
  }
}

// ─── Status: Check if MFA / TOTP is enabled on current account ───────────────
export async function getMfaStatusAction() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    let totpEnabled = false;
    try {
      const factors = await account.listMFAFactors();
      totpEnabled = factors.totp;
    } catch {
      // MFA factors endpoint may fail if not set up yet
    }
    return { mfa: user.mfa, totpEnabled, error: null };
  } catch (err) {
    return { mfa: false, totpEnabled: false, error: safeError(err, 'Failed to get MFA status') };
  }
}

// ─── Challenge: Create MFA challenge (used during login) ─────────────────────
export async function createMfaChallengeAction() {
  try {
    const { account } = await createSessionClient();
    const challenge = await account.createMFAChallenge({
      factor: AuthenticationFactor.Totp
    });
    return { challengeId: challenge.$id, error: null };
  } catch (err) {
    return { challengeId: null, error: safeError(err, 'Failed to create MFA challenge') };
  }
}

// ─── Challenge: Verify MFA challenge with OTP ────────────────────────────────
export async function verifyMfaChallengeAction(challengeId: string, otp: string) {
  try {
    const { account } = await createSessionClient();
    await account.updateMFAChallenge({ challengeId, otp });
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: safeError(err, 'Invalid verification code') };
  }
}
