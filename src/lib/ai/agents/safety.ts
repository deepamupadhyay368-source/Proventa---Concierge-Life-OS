export interface SafetyEvaluation {
  safeForAIResearch: boolean;
  requiresImmediateHumanHandoff: boolean;
  handoffReason?: string;
  confidenceScore: number;
}

export function evaluateSafetyAndHandoff(params: {
  rawInput: string;
  category?: string;
  estimatedAmountINR?: number;
}): SafetyEvaluation {
  const lower = params.rawInput.toLowerCase();

  // 1. Explicit human request
  if (lower.includes('talk to a person') || lower.includes('human') || lower.includes('speak with someone') || lower.includes('real person') || lower.includes('agent')) {
    return {
      safeForAIResearch: false,
      requiresImmediateHumanHandoff: true,
      handoffReason: 'Customer requested human concierge directly.',
      confidenceScore: 1.0,
    };
  }

  // 2. Cancellation, refund, or complaint
  if (lower.includes('refund') || lower.includes('cancel') || lower.includes('complain') || lower.includes('dispute') || lower.includes('unhappy') || lower.includes('terrible')) {
    return {
      safeForAIResearch: false,
      requiresImmediateHumanHandoff: true,
      handoffReason: 'Sensitive or dispute scenario requiring human management.',
      confidenceScore: 0.5,
    };
  }

  // 3. High financial value threshold (> ₹10,000)
  if (params.estimatedAmountINR && params.estimatedAmountINR > 10000) {
    return {
      safeForAIResearch: true,
      requiresImmediateHumanHandoff: true,
      handoffReason: `Transaction amount (₹${params.estimatedAmountINR}) exceeds automated threshold. Human concierge review required.`,
      confidenceScore: 0.8,
    };
  }

  return {
    safeForAIResearch: true,
    requiresImmediateHumanHandoff: false,
    confidenceScore: 0.95,
  };
}
