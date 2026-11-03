import { NextRequest, NextResponse } from 'next/server';
import {
  listDocuments,
  uploadDocument,
  confirmDocumentExtraction,
  deleteDocument,
  getDocumentById,
  syncWorkspaceDocuments,
} from '@/lib/wealth/vault';
import { loadPersistedDocuments, savePersistedDocuments } from '@/lib/wealth/persistence';
import { DocumentCategory } from '@/lib/wealth/types';
import { assertAuthorizedWorkspace } from '@/lib/wealth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization
    const authResult = await assertAuthorizedWorkspace(workspaceId);
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    const persisted = await loadPersistedDocuments(workspaceId, userId);
    if (persisted.length > 0) {
      syncWorkspaceDocuments(workspaceId, persisted);
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
    const body = await req.json();
    const workspaceId = body.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    if (body.action === 'CONFIRM_EXTRACTION') {
      const existing = getDocumentById(body.documentId);
      if (!existing || existing.workspaceId !== workspaceId) {
        return NextResponse.json(
          { success: false, error: 'Document not found or does not belong to specified workspace' },
          { status: 404 },
        );
      }

      const confirmed = confirmDocumentExtraction({
        documentId: body.documentId,
        userConfirmed: body.userConfirmed !== false,
        confirmedAmounts: body.confirmedAmounts,
      });

      const all = listDocuments({ workspaceId });
      await savePersistedDocuments(workspaceId, userId, all);

      return NextResponse.json({ success: true, data: confirmed });
    }

    const doc = uploadDocument({
      workspaceId,
      familyId: body.familyId || workspaceId,
      uploadedByUserId: userId,
      uploadedByUserName: authResult.session?.userName || body.uploadedByUserName || 'Vault Custodian',
      fileName: body.fileName || 'Financial_Document.pdf',
      fileSize: Number(body.fileSize || 1048576),
      mimeType: body.mimeType || 'application/pdf',
      category: body.category || 'OTHER',
      title: body.title || body.fileName || 'Financial Record',
      tags: body.tags || [],
      expiryDate: body.expiryDate,
    });

    const all = listDocuments({ workspaceId });
    await savePersistedDocuments(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    const workspaceId = searchParams.get('workspaceId');

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'documentId is required' }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    // Verify document belongs to this workspace
    const existing = getDocumentById(documentId);
    if (existing && existing.workspaceId !== workspaceId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Document belongs to a different workspace' },
        { status: 403 },
      );
    }

    deleteDocument(documentId);

    const all = listDocuments({ workspaceId });
    await savePersistedDocuments(workspaceId, userId, all);

    return NextResponse.json({ success: true, message: 'Document removed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
