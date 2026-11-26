import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { verifyReportAccessToken } from '@/lib/valuation/report-token';

export const dynamic = 'force-dynamic';

// AUDIT-DEFECT-04: Strict Cache-Control headers for sensitive asset valuation dossiers
const sensitiveCacheHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function jsonResponse(data: any, init?: { status?: number; headers?: HeadersInit }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      ...sensitiveCacheHeaders,
      ...(init?.headers || {}),
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return jsonResponse({ success: false, error: 'Missing report identifier.' }, { status: 400 });
    }

    const request = await db.valuationRequest.findUnique({
      where: { id: requestId },
      include: {
        payment: true,
        report: true,
        locality: true,
        project: true,
      },
    });

    if (!request) {
      // Prevent user enumeration and information leakage
      return jsonResponse({ success: false, error: 'Valuation report not found.' }, { status: 404 });
    }

    // 1. Strict Authentication & Authorization Guard (SEC-02)
    // Never allow anonymous access based on report ID alone.
    let isAuthorized = false;
    let authorizationType: 'SESSION' | 'SIGNED_TOKEN' | 'ADMIN' = 'SESSION';

    // A. Check Authenticated User Session
    const session = await getSession();
    if (session?.user?.id) {
      const isOwner = session.user.id === request.userId;
      const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.roles?.includes('CONCIERGE');

      if (isOwner) {
        isAuthorized = true;
        authorizationType = 'SESSION';
      } else if (isAdmin) {
        isAuthorized = true;
        authorizationType = 'ADMIN';
      } else {
        // Authenticated user attempting to access another user's report (IDOR protection)
        return jsonResponse(
          {
            success: false,
            error: 'UNAUTHORIZED: You do not have permission to view another customer’s private valuation report.',
          },
          { status: 403 }
        );
      }
    }

    // B. Check Cryptographically Signed Email Access Token (for guest purchasers or direct email links)
    if (!isAuthorized) {
      const token =
        req.nextUrl.searchParams.get('token') ||
        req.headers.get('x-report-access-token') ||
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

      if (token) {
        const tokenResult = verifyReportAccessToken(token, request.id);
        if (tokenResult.valid && tokenResult.payload?.userId === request.userId) {
          isAuthorized = true;
          authorizationType = 'SIGNED_TOKEN';
        } else if (tokenResult.error === 'TOKEN_EXPIRED') {
          return jsonResponse(
            {
              success: false,
              error: 'EXPIRED_TOKEN: The report access link has expired. Please sign in or request a renewed access link.',
            },
            { status: 401 }
          );
        } else if (tokenResult.error === 'TOKEN_REQUEST_MISMATCH') {
          return jsonResponse(
            {
              success: false,
              error: 'INVALID_TOKEN: This access token is not authorized for this specific valuation dossier.',
            },
            { status: 401 }
          );
        } else {
          return jsonResponse(
            {
              success: false,
              error: 'INVALID_TOKEN: Invalid, malformed, or tampered report access token.',
            },
            { status: 401 }
          );
        }
      }
    }

    // C. Rejection if neither session nor valid signed token is present
    if (!isAuthorized) {
      return jsonResponse(
        {
          success: false,
          error: 'AUTHENTICATION_REQUIRED: An active authenticated session or a valid signed email access token is required to view this valuation dossier.',
        },
        { status: 401 }
      );
    }

    // 2. Strict Paywall & Refund Revocation Enforcement (AUDIT-DEFECT-03)
    if (request.payment?.status === 'REFUNDED' || request.report?.status === 'ARCHIVED') {
      return jsonResponse(
        {
          success: false,
          error: 'ACCESS_REVOKED: This valuation dossier has been revoked due to a processed refund or archive.',
        },
        { status: 403 }
      );
    }

    const isPaid = request.payment?.status === 'CAPTURED';
    if (!isPaid) {
      return jsonResponse(
        {
          success: false,
          error: 'ACCESS_RESTRICTED: Valuation report is inaccessible until payment has been successfully captured.',
          redirectUrl: `/price/preview/${request.id}`,
        },
        { status: 403 }
      );
    }

    // 3. Report Generation Status Verification
    if (!request.report || request.report.status !== 'READY') {
      return jsonResponse(
        { success: false, error: 'Report is currently processing. Please refresh in a moment.' },
        { status: 202 }
      );
    }

    // Increment download/view counter
    await db.valuationReport.update({
      where: { id: request.report.id },
      data: { downloadedCount: { increment: 1 } },
    });

    return jsonResponse({
      success: true,
      reportReference: request.report.reportReference,
      status: request.report.status,
      generatedAt: request.report.generatedAt,
      reportData: request.report.reportDataJson,
      authorizationType,
    });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return jsonResponse(
      { success: false, error: 'Failed to retrieve valuation report.' },
      { status: 500 }
    );
  }
}
