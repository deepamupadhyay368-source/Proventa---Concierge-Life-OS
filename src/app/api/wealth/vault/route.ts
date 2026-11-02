import { NextRequest, NextResponse } from 'next/server';
import {
  listDocuments,
  uploadDocument,
  confirmDocumentExtraction,
  deleteDocument,
} from '@/lib/wealth/vault';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }
    const category = searchParams.get('category') as any;
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

    if (body.action === 'CONFIRM_EXTRACTION') {
      const confirmed = confirmDocumentExtraction({
        documentId: body.documentId,
        userConfirmed: body.userConfirmed !== false,
        confirmedAmounts: body.confirmedAmounts,
      });
      return NextResponse.json({ success: true, data: confirmed });
    }

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    const doc = uploadDocument({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      uploadedByUserId: body.uploadedByUserId || 'usr_member',
      uploadedByUserName: body.uploadedByUserName || 'Vault Custodian',
      fileName: body.fileName || 'Financial_Document.pdf',
      fileSize: Number(body.fileSize || 1048576),
      mimeType: body.mimeType || 'application/pdf',
      category: body.category || 'OTHER',
      title: body.title || 'Untitled Financial Document',
      tags: body.tags || [],
      expiryDate: body.expiryDate,
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Document ID required' }, { status: 400 });
    }
    const deleted = deleteDocument(id);
    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
