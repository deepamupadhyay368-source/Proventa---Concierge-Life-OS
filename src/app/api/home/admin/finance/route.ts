import { NextRequest, NextResponse } from 'next/server';
import { HomePricingEngine } from '@/lib/home/pricing-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scenario = (searchParams.get('scenario') as any) || 'EXPECTED_UTILISATION';

  const validScenarios = ['LOW_UTILISATION', 'EXPECTED_UTILISATION', 'HIGH_UTILISATION'];
  const activeScenario = validScenarios.includes(scenario) ? scenario : 'EXPECTED_UTILISATION';

  const lowScenario = HomePricingEngine.runScenario('LOW_UTILISATION');
  const expectedScenario = HomePricingEngine.runScenario('EXPECTED_UTILISATION');
  const highScenario = HomePricingEngine.runScenario('HIGH_UTILISATION');

  return NextResponse.json({
    success: true,
    activeScenario,
    comparison: {
      low: lowScenario,
      expected: expectedScenario,
      high: highScenario
    }
  });
}
