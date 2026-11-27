import { NextResponse } from 'next/server';
import { generatePacificaPilotAssessment } from '@/lib/construction-procurement/pacifica-pilot';

export async function GET() {
  const assessment = generatePacificaPilotAssessment();

  // Safely serialize BigInt fields for JSON response
  const serialized = {
    ...assessment,
    comparison: {
      ...assessment.comparison,
      rows: assessment.comparison.rows.map((r) => ({
        ...r,
        baseMaterialPaise: r.baseMaterialPaise.toString(),
        gstPaise: r.gstPaise.toString(),
        freightPaise: r.freightPaise.toString(),
        loadingPaise: r.loadingPaise.toString(),
        unloadingPaise: r.unloadingPaise.toString(),
        insurancePaise: r.insurancePaise.toString(),
        otherChargesPaise: r.otherChargesPaise.toString(),
        discountPaise: r.discountPaise.toString(),
        totalLandedCostPaise: r.totalLandedCostPaise.toString(),
        unitLandedCostPaise: r.unitLandedCostPaise.toString(),
      })),
    },
    potentialSavings: {
      ...assessment.potentialSavings,
      unitDifferencePaise: assessment.potentialSavings.unitDifferencePaise.toString(),
      totalSavingsPaise: assessment.potentialSavings.totalSavingsPaise.toString(),
    },
  };

  return NextResponse.json({ success: true, data: serialized });
}
