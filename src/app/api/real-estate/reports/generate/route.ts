import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import {
  buildRealEstateReport,
  type RealEstateReportType,
} from '@/lib/real-estate-intelligence/report-generator';

const generateReportSchema = z.object({
  reportType: z.enum([
    'PROPERTY_INTELLIGENCE',
    'PROJECT_INTELLIGENCE',
    'LOCALITY_INTELLIGENCE',
    'INVESTMENT_FEASIBILITY',
    'PROPERTY_VALUATION',
    'PORTFOLIO_PERFORMANCE',
    'MARKET_COMPARISON',
  ]),
  subjectTitle: z.string().trim().min(3).max(200),
  geography: z.string().trim().max(140).optional(),
  metrics: z.record(z.string(), z.unknown()).default({}),
  methodology: z.string().trim().min(5).max(800),
  dataSources: z.array(z.string().trim().min(2)).max(25).default([]),
  confidenceLevel: z.enum(['HIGH', 'MODERATE', 'LOW', 'INSUFFICIENT_DATA']).default('MODERATE'),
  assumptions: z.array(z.string().trim().min(2)).max(20).optional(),
  limitations: z.array(z.string().trim().min(2)).max(20).optional(),
});

/**
 * POST /api/real-estate/reports/generate
 * Generates structured, auditable payloads for all 7 institutional report types
 * with mandatory non-certified valuation disclaimers.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to generate institutional reports.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = generateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid report generation payload.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const report = buildRealEstateReport({
      reportType: d.reportType as RealEstateReportType,
      subjectTitle: d.subjectTitle,
      geography: d.geography,
      metrics: d.metrics,
      methodology: d.methodology,
      dataSources: d.dataSources,
      confidenceLevel: d.confidenceLevel,
      assumptions: d.assumptions,
      limitations: d.limitations,
    });

    return NextResponse.json({
      generatedByUserId: session.user.id,
      report,
    });
  } catch (err) {
    console.error('[POST /api/real-estate/reports/generate]', err);
    return NextResponse.json({ error: 'Failed to generate intelligence report.' }, { status: 500 });
  }
}
