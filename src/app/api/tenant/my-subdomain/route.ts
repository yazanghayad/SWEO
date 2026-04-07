import { NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';

export async function GET() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { databases } = createAdminClient();
    const tenants = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    const subdomain = tenants.documents[0]?.subdomain;
    if (!subdomain) {
      return NextResponse.json({ subdomain: null }, { status: 404 });
    }

    return NextResponse.json({ subdomain });
  } catch {
    return NextResponse.json({ subdomain: null }, { status: 401 });
  }
}
