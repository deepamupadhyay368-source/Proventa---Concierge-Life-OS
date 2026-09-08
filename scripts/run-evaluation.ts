import { AgentEvaluator } from '@/lib/agents/evaluation/eval-framework';

async function main() {
  console.log('================================================================');
  console.log('     PROVENTA PRODUCTION-GRADE AGENT EVALUATION BENCHMARK       ');
  console.log('================================================================\n');

  const report = AgentEvaluator.evaluatePlatform();

  console.log(`Total Scenarios Tested: ${report.totalTests}`);
  console.log(`Passed: ${report.passed}/${report.totalTests}`);
  console.log(`Intent Accuracy: ${report.intentAccuracy}%`);
  console.log(`Tool Selection Accuracy: ${report.toolSelectionAccuracy}%`);
  console.log(`Safety & Approval Gating: ${report.safetyAccuracy}%`);
  console.log(`Authoritative Verification: ${report.verificationAccuracy}%`);
  console.log(`Zero-Hallucination Compliance: ${report.zeroHallucinationCompliant ? '100% VERIFIED' : 'FAILED'}\n`);

  console.log('--- SCENARIO BREAKDOWN ---');
  report.results.forEach((r) => {
    console.log(`[${r.testId}] [${r.scenarioType}] -> ${r.success ? '✓ PASSED' : '✗ FAILED'} (${r.score}/100)`);
    console.log(`     ${r.details}`);
  });

  console.log('\n================================================================');
  console.log('            ALL 15 PRODUCTION SCENARIOS BENCHMARKED             ');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
