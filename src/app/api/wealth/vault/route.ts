import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  listDocuments,
  uploadDocument,
  confirmDocumentExtraction,
  deleteDocument,
  syncWorkspaceDocuments,
} from '@/lib/wealth/vault';
import { loadPersistedDocuments, savePersistedDocuments } from '@/lib/wealth/persistence';
import { DocumentCategory } from '@/lib/wealth/types';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user documents' },
        { status: 403 },
      );
    }

    if (userId) {
      const persisted = await loadPersistedDocuments(workspaceId, userId);
      if (persisted.length > 0) {
        syncWorkspaceDocuments(workspaceId, persisted);
      }
    }

    const category = searchParams.get('category') as DocumentCategory | undefined;
    const search = searchParams.get('search') || undefined;

    const docs = listDocuments({ workspaceId, category, search });
    return NextResponse.json({ success: true, data: docs });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();

    if (body.action === 'CONFIRM_EXTRACTION') {
      const confirmed = confirmDocumentExtraction({
        documentId: body.documentId,
        userConfirmed: body.userConfirmed !== false,
        confirmedAmounts: body.confirmedAmounts,
      });

      if (userId && body.workspaceId) {
        const all = listDocuments({ workspaceId: body.workspaceId });
        await savePersistedDocuments(body.workspaceId, userId, all);
      }

      return NextResponse.json({ success: true, data: confirmed });
    }

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && body.workspaceId.startsWith('ind_') && body.workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot upload documents to another user workspace' },
        { status: 403 },
      );
    }

    const doc = uploadDocument({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      uploadedByUserId: userId || body.uploadedByUserId || 'usr_member',
      uploadedByUserName: session?.user?.name || body.uploadedByUserName || 'Vault Custodian',
      fileName: body.fileName || 'Financial_Document.pdf',
      fileSize: Number(body.fileSize || 1048576),
      mimeType: body.mimeType || 'application/pdf',
      category: body.category || 'OTHER',
      title: body.title || body.fileName || 'Financial Record',
      tags: body.tags || [],
      expiryDate: body.expiryDate,
    });

    if (userId) {
      const all = listDocuments({ workspaceId: body.workspaceId });
      await savePersistedDocuments(body.workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    const workspaceId = searchParams.get('workspaceId');

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'documentId is required' }, { status: 400 });
    }

    deleteDocument(documentId);

    if (userId && workspaceId) {
      const all = listDocuments({ workspaceId });
      await savePersistedDocuments(workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, message: 'Document removed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
