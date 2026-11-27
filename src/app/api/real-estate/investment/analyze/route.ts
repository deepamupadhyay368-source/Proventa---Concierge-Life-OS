import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runFullInvestmentAnalysis } from '@/lib/real-estate-intelligence/investment-engine';
import {
  buildRateLimitHeaders,
  checkRateLimitAsync,
  getClientIpFromHeaders,
} from '@/lib/real-estate-intelligence/rate-limit';

const investmentAnalyzeSchema = z.object({
  purchasePriceRupees: z.number().positive(),
  stampDutyPercent: z.number().min(0).max(20).default(4.9),
  registrationPercent: z.number().min(0).max(10).default(1.0),
  brokeragePercent: z.number().min(0).max(10).default(1.0),
  renovationCostRupees: z.number().min(0).default(0),
  monthlyRentRupees: z.number().min(0),
  annualMaintenanceRupees: z.number().min(0).default(0),
  annualPropertyTaxRupees: z.number().min(0).optional(),
  vacancyRatePercent: z.number().min(0).max(100).default(8),
  loanToValuePercent: z.number().min(0).max(95).default(70),
  interestRatePercent: z.number().min(0).max(30).default(8.75),
  loanTenureYears: z.number().int().min(1).max(40).default(20),
  holdingPeriodYears: z.number().int().min(1).max(40).default(7),
  annualAppreciationPercent: z.number().min(-20).max(40).default(8),
  annualRentEscalationPercent: z.number().min(-10).max(25).optional(),
  scorecardInputs: z
    .object({
      locationScore: z.number().min(0).max(100),
      liquidityScore: z.number().min(0).max(100),
      rentalPotentialScore: z.number().min(0).max(100),
      priceCompetitivenessScore: z.number().min(0).max(100),
      developerRiskScore: z.number().min(0).max(100),
      dataConfidenceScore: z.number().min(0).max(100),
    })
    .optional(),
});

/**
 * POST /api/real-estate/investment/analyze
 * Public rate-limited deterministic Institutional Investment Intelligence Calculator.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rl = await checkRateLimitAsync(`invest:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before running another analysis.' },
        { status: 429, headers: buildRateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const parsed = investmentAnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid investment analysis inputs.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = runFullInvestmentAnalysis(parsed.data);
    return NextResponse.json({
      inputs: parsed.data,
      analysis: result,
    });
  } catch (err) {
    console.error('[POST /api/real-estate/investment/analyze]', err);
    return NextResponse.json({ error: 'Failed to run investment analysis.' }, { status: 500 });
  }
}
