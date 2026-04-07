import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_BUCKET } from '@/lib/appwrite/constants';
import { addCaseDocument } from '@/features/cases/actions/case-crud';
import { validateMagicBytes } from '@/lib/security/magic-bytes';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

export async function POST(req: NextRequest) {
  try {
    // Verify session
    const session = await createSessionClient();
    await session.account.get(); // throws if not authed

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const caseId = form.get('caseId') as string | null;

    if (!file || !caseId) {
      return NextResponse.json(
        { success: false, error: 'Missing file or caseId' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 10 MB)' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File type not allowed. Supported: PDF, DOC, DOCX, TXT, CSV, XLSX, PNG, JPG, WEBP'
        },
        { status: 400 }
      );
    }

    // Upload to Appwrite Storage using admin client
    const admin = createAdminClient();
    const { Storage } = await import('node-appwrite');
    const { InputFile } = require('node-appwrite/file') as {
      InputFile: {
        fromBuffer: (data: Buffer | Blob, name: string) => File;
      };
    };
    const storage = new Storage(admin.client);

    // Convert File to buffer for node-appwrite SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes to prevent MIME-type spoofing
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File content does not match the declared file type'
        },
        { status: 400 }
      );
    }

    const uploaded = await storage.createFile(
      APPWRITE_BUCKET,
      ID.unique(),
      InputFile.fromBuffer(buffer, file.name)
    );

    // Create case document record
    const result = await addCaseDocument(caseId, {
      fileId: uploaded.$id,
      fileName: file.name,
      fileMimeType: file.type,
      fileSize: file.size
    });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      // Clean up uploaded file if DB record fails
      try {
        await storage.deleteFile(APPWRITE_BUCKET, uploaded.$id);
      } catch {
        // ignore cleanup error
      }
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
