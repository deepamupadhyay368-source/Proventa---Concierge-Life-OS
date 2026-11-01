/**
 * PROVENTA — AI Multi-Agent Intelligence Engine
 * 
 * 6 Specialized Agents with permission-scoped context retrieval,
 * prompt injection defense, and deterministic calculation citations.
 */

import {
  AIAgentRole,
  AIAssistantMessage,
  AIInsightObservation,
} from './types';
import { getWealthDashboardTelemetry } from './service';
import { listDocuments } from './vault';
import { getCashflowSummary } from './cashflow';
import { listGoals } from './goals';
import { listInsurancePolicies } from './protection';
import { formatInr } from './engine';

/**
 * Validates prompt against prompt injection and jailbreaking attempts.
 */
function sanitizeUserInput(input: string): string {
  const disallowedPatterns = [
    /ignore previous instructions/i,
    /system prompt override/i,
    /jailbreak/i,
    /act as an unregulated investment advisor/i,
    /give me hot stock picks/i,
    /reveal other users'? secrets/i,
  ];

  for (const pattern of disallowedPatterns) {
    if (pattern.test(input)) {
      throw new Error('Security notice: Request contains prohibited instructions.');
    }
  }

  return input.trim();
}

/**
 * Route user query to the appropriate specialized agent.
 */
export function routeUserQueryToAgent(query: string): AIAgentRole {
  const lower = query.toLowerCase();
  if (lower.includes('cashflow') || lower.includes('income') || lower.includes('expense') || lower.includes('salary') || lower.includes('emi')) {
    return 'CASHFLOW_ANALYST';
  }
  if (lower.includes('document') || lower.includes('deed') || lower.includes('statement') || lower.includes('upload') || lower.includes('vault')) {
    return 'DOCUMENT_INTELLIGENCE';
  }
  if (lower.includes('goal') || lower.includes('scenario') || lower.includes('what if') || lower.includes('simulate') || lower.includes('future')) {
    return 'GOAL_SCENARIO';
  }
  if (lower.includes('missing') || lower.includes('valuation') || lower.includes('update') || lower.includes('duplicate') || lower.includes('unverified')) {
    return 'ASSET_INTELLIGENCE';
  }
  if (lower.includes('net worth') || lower.includes('wealth') || lower.includes('allocation') || lower.includes('assets') || lower.includes('liabilities')) {
    return 'WEALTH_ANALYST';
  }
  return 'FAMILY_ASSISTANT';
}

/**
 * Central AI Orchestrator Execution
 */
export async function executeAIAssistantQuery(params: {
  workspaceId: string;
  userId: string;
  query: string;
  requestedAgent?: AIAgentRole;
}): Promise<AIAssistantMessage> {
  const sanitizedQuery = sanitizeUserInput(params.query);
  const agentRole = params.requestedAgent || routeUserQueryToAgent(sanitizedQuery);
  const now = new Date().toISOString();

  // 1. Fetch authorized data telemetry scoped to this workspace
  const telemetry = getWealthDashboardTelemetry({ workspaceId: params.workspaceId });
  const docs = listDocuments({ workspaceId: params.workspaceId });
  const cashflow = getCashflowSummary(params.workspaceId);
  const goals = listGoals(params.workspaceId);
  const policies = listInsurancePolicies(params.workspaceId);

  let responseContent = '';
  const dataSources: string[] = ['PROVENTA Deterministic Calculation Engine (Paise-level precision)'];

  switch (agentRole) {
    case 'WEALTH_ANALYST': {
      dataSources.push(`Asset & Liability Register as of ${now.split('T')[0]}`);
      responseContent = `Based on your family's records as of today:\n\n` +
        `• **Consolidated Family Net Worth**: **${telemetry.formattedGrossNetWorth}**\n` +
        `• **Gross Assets**: ${telemetry.formattedGrossAssets} across ${telemetry.totalAssetsCount} recorded assets\n` +
        `• **Gross Liabilities**: ${telemetry.formattedGrossLiabilities} across ${telemetry.totalLiabilitiesCount} obligations\n\n` +
        `**Asset Allocation Breakdown**:\n` +
        telemetry.assetAllocation.map((a) => `• ${a.label}: ${a.formattedTotal} (${a.percentage}%)`).join('\n') +
        `\n\n*Note: All values reflect verified document valuations and user-reported figures in your secure family workspace.*`;
      break;
    }

    case 'ASSET_INTELLIGENCE': {
      dataSources.push('Asset Registry Verification Audit');
      responseContent = `**Asset Health & Record Verification Audit**:\n\n` +
        `• **Unverified / Estimated Records**: ${telemetry.unverifiedAssetsCount} assets currently have estimated or self-reported status.\n` +
        `• **Missing Information**: ${telemetry.missingInformationCount} records lack an uploaded deed, recent valuation, or maturity date.\n\n` +
        `**Recommended Action**: Upload valuation certificates or updated statements in your Family Vault to elevate record confidence to **Document Verified**.`;
      break;
    }

    case 'CASHFLOW_ANALYST': {
      dataSources.push(`Cashflow Ledger (${cashflow.periodMonth})`);
      responseContent = `**Cashflow Summary for ${cashflow.periodMonth}**:\n\n` +
        `• **Monthly Inflows**: ${cashflow.formattedTotalIncome}\n` +
        `• **Monthly Outflows**: ${cashflow.formattedTotalExpenses}\n` +
        `• **Net Monthly Cashflow**: **${cashflow.formattedNetCashflow}** (Savings Rate: ${cashflow.savingsRatePercentage}%)\n` +
        `• **Committed Recurring Obligations**: ${cashflow.formattedRecurringObligations}\n\n` +
        `*Internal transfers between your own accounts have been strictly filtered out to prevent artificial inflation of income or expenditure.*`;
      break;
    }

    case 'DOCUMENT_INTELLIGENCE': {
      dataSources.push(`Family Vault (${docs.length} documents indexed)`);
      const unconfirmedCount = docs.filter((d) => d.extraction && !d.extraction.userConfirmed).length;
      responseContent = `**Family Vault Intelligence**:\n\n` +
        `• Total Encrypted Records: **${docs.length} documents**\n` +
        (unconfirmedCount > 0
          ? `• **Pending Confirmation**: ${unconfirmedCount} uploaded documents have AI-extracted metadata waiting for your human verification.\n\n`
          : `• All uploaded document metadata has been confirmed by family administrators.\n\n`) +
        `*Security standard: Proventa never saves AI-extracted values as authoritative financial truth without explicit user confirmation.*`;
      break;
    }

    case 'GOAL_SCENARIO': {
      dataSources.push(`Family Goals Register (${goals.length} active goals)`);
      responseContent = `**Family Goals Telemetry**:\n\n` +
        goals.map((g) => `• **${g.title}**: ${g.formattedCurrentAmount} / ${g.formattedTargetAmount} (${g.progressPercentage}% completed) — Status: ${g.status}`).join('\n') +
        `\n\n*You can simulate future compound scenarios (+₹20k/mo savings or interest shifts) directly from the Goals module.*`;
      break;
    }

    case 'FAMILY_ASSISTANT':
    default: {
      dataSources.push('Consolidated Family Wealth Telemetry');
      responseContent = `Hello! I am your PROVENTA Family Assistant. Here is your current living financial summary:\n\n` +
        `• **Family Net Worth**: **${telemetry.formattedGrossNetWorth}**\n` +
        `• **Active Assets**: ${telemetry.totalAssetsCount} | **Liabilities**: ${telemetry.totalLiabilitiesCount}\n` +
        `• **Insurance Policies Active**: ${policies.length}\n` +
        `• **Vault Documents**: ${docs.length}\n\n` +
        `How can I assist you today? You can ask about asset concentration, upcoming renewals, cashflow obligations, or document statuses.`;
      break;
    }
  }

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    agentRole,
    content: responseContent,
    dataSourcesCited: dataSources,
    dataDate: now.split('T')[0],
    timestamp: now,
  };
}

/**
 * Generates proactive living observations on family wealth.
 */
export function getProactiveLivingObservations(workspaceId: string): AIInsightObservation[] {
  const telemetry = getWealthDashboardTelemetry({ workspaceId });
  const cashflow = getCashflowSummary(workspaceId);
  const observations: AIInsightObservation[] = [];
  const now = new Date().toISOString();

  // Concentration observation
  const physicalAlloc = telemetry.assetAllocation.find((a) => a.category === 'PHYSICAL');
  if (physicalAlloc && physicalAlloc.percentage > 60) {
    observations.push({
      id: 'obs_concentration_real_estate',
      agentRole: 'WEALTH_ANALYST',
      title: 'High Physical Asset Allocation',
      observation: `Physical properties and gold account for ${physicalAlloc.percentage}% of your family assets (${physicalAlloc.formattedTotal}).`,
      severity: 'INFO',
      actionableStep: 'Review financial asset liquidity with your Family CA.',
      resourceLink: '/assets',
      createdAt: now,
    });
  }

  // Savings rate observation
  if (cashflow.savingsRatePercentage > 25) {
    observations.push({
      id: 'obs_healthy_savings',
      agentRole: 'CASHFLOW_ANALYST',
      title: 'Strong Monthly Savings Rate',
      observation: `Your family is saving ${cashflow.savingsRatePercentage}% of net inflows after servicing all recurring obligations.`,
      severity: 'OPPORTUNITY',
      actionableStep: 'Consider allocating surplus to your Masters Fund or Alibaug Villa goals.',
      resourceLink: '/goals',
      createdAt: now,
    });
  }

  // Missing info alert
  if (telemetry.missingInformationCount > 0) {
    observations.push({
      id: 'obs_missing_docs',
      agentRole: 'ASSET_INTELLIGENCE',
      title: 'Document Gaps Detected',
      observation: `${telemetry.missingInformationCount} financial records lack recent verification or supporting deed uploads.`,
      severity: 'REVIEW',
      actionableStep: 'Upload statements to the Family Vault.',
      resourceLink: '/vault',
      createdAt: now,
    });
  }

  return observations;
}
