'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { ID, Permission, Role } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { safeError } from '@/lib/safe-error';

/**
 * Get the current user's profile from Appwrite Account API.
 */
export async function getProfileAction() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return {
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        prefs: { ...user.prefs } as Record<string, string>,
        createdAt: user.$createdAt
      },
      error: null
    };
  } catch (err) {
    return {
      user: null,
      error: safeError(err, 'Failed to load profile')
    };
  }
}

/**
 * Update the current user's name via Appwrite Account API.
 */
export async function updateProfileNameAction(name: string) {
  try {
    const { account } = await createSessionClient();
    await account.updateName(name);
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to update name')
    };
  }
}

/**
 * Update the current user's email via Appwrite Account API.
 * Requires current password for verification.
 */
export async function updateProfileEmailAction(
  email: string,
  password: string
) {
  try {
    const { account } = await createSessionClient();
    await account.updateEmail(email, password);
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to update email')
    };
  }
}

/**
 * Update user preferences (job title, bio, language, timezone, etc.)
 * via Appwrite Account prefs.
 */
export async function updateProfilePrefsAction(
  prefs: Record<string, string>
) {
  try {
    const { account } = await createSessionClient();
    // Appwrite prefs are merged, so we just pass the partial update
    const existing = await account.getPrefs();
    await account.updatePrefs({ ...existing, ...prefs });
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to update preferences')
    };
  }
}

/**
 * Update the current user's password via Appwrite Account API.
 */
export async function updatePasswordAction(
  newPassword: string,
  oldPassword: string
) {
  try {
    const { account } = await createSessionClient();
    await account.updatePassword(newPassword, oldPassword);
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to update password')
    };
  }
}

/**
 * List active sessions for the current user.
 */
export async function listSessionsAction() {
  try {
    const { account } = await createSessionClient();
    const sessions = await account.listSessions();
    return {
      sessions: sessions.sessions.map((s) => ({
        id: s.$id,
        provider: s.provider,
        ip: s.ip,
        osName: s.osName,
        clientName: s.clientName,
        current: s.current,
        createdAt: s.$createdAt
      })),
      error: null
    };
  } catch (err) {
    return {
      sessions: [],
      error: safeError(err, 'Failed to list sessions')
    };
  }
}

/**
 * Delete a specific session (logout from device).
 */
export async function deleteSessionAction(sessionId: string) {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession(sessionId);
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to delete session')
    };
  }
}

/**
 * Upload an avatar image via Appwrite Storage and persist the file URL
 * in user prefs.avatarUrl.
 */
export async function uploadAvatarAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'No file provided' };

    // Validate type and size
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return { success: false, error: 'Only JPG, PNG and WebP are allowed' };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File must be smaller than 2 MB' };
    }

    const { account } = await createSessionClient();
    const user = await account.get();

    const { storage } = createAdminClient();
    const bucketId = 'avatars';

    // Delete previous avatar if it exists
    const prevId = user.prefs?.avatarFileId;
    if (prevId) {
      try { await storage.deleteFile(bucketId, prevId); } catch { /* ignore */ }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = ID.unique();
    const inputFile = InputFile.fromBuffer(buffer, file.name);

    await storage.createFile(bucketId, fileId, inputFile, [
      Permission.read(Role.any())
    ]);

    // Build a public file URL with cache-bust param
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? '';
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? '';
    const avatarUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${project}&t=${Date.now()}`;

    // Persist in user prefs via session client (user's own account)
    const existing = await account.getPrefs();
    await account.updatePrefs({ ...existing, avatarUrl, avatarFileId: fileId });


    return { success: true, avatarUrl, error: null };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to upload avatar')
    };
  }
}
