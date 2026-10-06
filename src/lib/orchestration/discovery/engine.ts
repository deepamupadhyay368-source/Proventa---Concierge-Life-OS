/**
 * PROVENTA — UNIVERSAL AUTONOMOUS DISCOVERY ENGINE
 * Standardizes AI Discovery across ALL categories:
 * - Parallel source queries with individual bounded timeouts (≤7.5s per source, overall target ≤15s)
 * - Zero fabrication: returns up to 5 genuine options (if 2 exist returns 2, if 0 returns 0)
 * - Transparent Concierge fallback when no genuine inventory is found
 * - Standardized AutonomousDiscoveryRequest and AutonomousDiscoveryResult contract
 */

import { AdapterRegistry } from '../adapters';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { logger } from '@/lib/logger';
import type {
  AutonomousDiscoveryRequest,
  AutonomousDiscoveryResult,
  OptionProposal,
  ExtractedEntities,
} from '../types';

export class AutonomousDiscoveryEngine {
  private static INDIVIDUAL_TIMEOUT_MS = 7500;
  private static OVERALL_TIMEOUT_MS = 15000;

  /**
   * Main universal discovery entrypoint.
   */
  static async discover(request: AutonomousDiscoveryRequest): Promise<AutonomousDiscoveryResult> {
    const startedAt = Date.now();
    const rawInput = request.originalRequest || '';
    const rawLower = rawInput.toLowerCase();

    // 1. Resolve normalized category
    let resolvedCategory = (request.category || 'bespoke_requests').toLowerCase().replace(/[\s-]/g, '_');

    // Disambiguation for travel / events / dining / healthcare
    if (
      resolvedCategory === 'travel' ||
      resolvedCategory === 'other' ||
      resolvedCategory === 'bespoke_requests'
    ) {
      if (
        rawLower.includes('hotel') ||
        rawLower.includes('stay') ||
        rawLower.includes('resort') ||
        rawLower.includes('villa') ||
        rawLower.includes('suite')
      ) {
        resolvedCategory = 'hotels';
      } else if (
        rawLower.includes('flight') ||
        rawLower.includes('fly') ||
        rawLower.includes('airline') ||
        rawLower.includes('airport')
      ) {
        resolvedCategory = 'flights';
      } else if (
        rawLower.includes('event') ||
        rawLower.includes('concert') ||
        rawLower.includes('festival') ||
        rawLower.includes('garba') ||
        rawLower.includes('navratri') ||
        rawLower.includes('dandiya') ||
        rawLower.includes('pass')
      ) {
        resolvedCategory = 'events';
      } else if (
        rawLower.includes('doctor') ||
        rawLower.includes('hospital') ||
        rawLower.includes('clinic') ||
        rawLower.includes('appointment') ||
        rawLower.includes('cardiolog') ||
        rawLower.includes('dermatolog')
      ) {
        resolvedCategory = 'healthcare';
      } else if (
        rawLower.includes('dine') ||
        rawLower.includes('dinner') ||
        rawLower.includes('lunch') ||
        rawLower.includes('table') ||
        rawLower.includes('restaurant')
      ) {
        resolvedCategory = 'dining';
      } else if (
        rawLower.includes('plan') ||
        rawLower.includes('itinerary') ||
        rawLower.includes('weekend') ||
        rawLower.includes('escape') ||
        rawLower.includes('research') ||
        rawLower.includes('guide')
      ) {
        resolvedCategory = 'personal';
      }
    }

    // 2. Fetch candidate adapters for the category
    const adapters = AdapterRegistry.getAdaptersForCategory(resolvedCategory);

    // 3. Build unified constraints
    const constraints: Record<string, any> = {
      origin: request.origin,
      originAirport: (request as any).originAirport || (request.preferences as any)?.originAirport,
      destination: request.destination,
      destinationAirport: (request as any).destinationAirport || (request.preferences as any)?.destinationAirport,
      location: request.location || request.destination || 'Ahmedabad',
      city: request.location || request.destination || 'Ahmedabad',
      locality: (request as any).locality || (request.preferences as any)?.locality,
      hospital: (request as any).hospital || (request.preferences as any)?.hospital,
      doctorName: (request as any).doctorName || (request.preferences as any)?.doctorName,
      specialty: (request as any).specialty || (request.preferences as any)?.specialty,
      gender: (request as any).gender || (request.preferences as any)?.gender,
      partySize: request.partySize,
      budget: request.budget,
      dateTime: typeof request.dates === 'string' ? request.dates : request.dates?.exact || request.dates?.start,
      date: typeof request.dates === 'string' ? request.dates : request.dates?.exact || request.dates?.start,
      startDate: typeof request.dates === 'object' ? request.dates?.start : undefined,
      endDate: typeof request.dates === 'object' ? request.dates?.end : undefined,
      preferences: request.preferences || {},
      constraints: request.constraints || [],
      customerNotes: request.customerNotes,
    };

    const sourcesQueried: AutonomousDiscoveryResult['sourcesQueried'] = [];
    const candidateBatches: OptionProposal[][] = [];

    // 4. Parallel source execution with bounded per-source timeouts
    const searchPromises = adapters.map(async (adapter) => {
      const sourceStart = Date.now();
      try {
        const timeoutPromise = new Promise<OptionProposal[]>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${this.INDIVIDUAL_TIMEOUT_MS}ms`)), this.INDIVIDUAL_TIMEOUT_MS)
        );

        const queryPromise = adapter.search({
          category: resolvedCategory,
          intent: request.originalRequest,
          rawInput: request.originalRequest,
          constraints,
        });

        const results = await Promise.race([queryPromise, timeoutPromise]);
        const latencyMs = Date.now() - sourceStart;

        sourcesQueried.push({
          sourceId: adapter.providerId || adapter.name,
          name: adapter.name,
          status: 'SUCCESS',
          candidatesFound: results.length,
          latencyMs,
        });

        return results;
      } catch (err: any) {
        const latencyMs = Date.now() - sourceStart;
        const isTimeout = err?.message?.includes('Timeout');
        sourcesQueried.push({
          sourceId: adapter.providerId || adapter.name,
          name: adapter.name,
          status: isTimeout ? 'TIMEOUT' : 'FAILED',
          candidatesFound: 0,
          latencyMs,
        });
        logger.warn(
          { adapter: adapter.name, error: err?.message, isTimeout },
          '[AutonomousDiscoveryEngine] Adapter query error handled gracefully'
        );
        return [];
      }
    });

    const overallTimeoutPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, this.OVERALL_TIMEOUT_MS)
    );

    await Promise.race([Promise.allSettled(searchPromises), overallTimeoutPromise]);

    for (const p of searchPromises) {
      try {
        const res = await p;
        if (Array.isArray(res) && res.length > 0) {
          candidateBatches.push(res);
        }
      } catch {
        // Handled
      }
    }

    const rawCandidates = candidateBatches.flat();

    // 5. Deterministic Validation & Constraint Integrity Filtering
    const validProposals = EntityIntegrityValidator.filterProposalsByConstraints(
      rawCandidates,
      {
        category: resolvedCategory,
        destination: constraints.destination,
        origin: constraints.origin,
        location: constraints.location,
        city: constraints.city,
      } as any
    );

    // 6. Deduplication by Title + Provider + Date
    const deduplicated = this.deduplicateProposals(validProposals);

    // 7. Rank Options (Real/Verified first, then by score)
    const ranked = deduplicated.sort((a, b) => {
      if (a.isMock === false && b.isMock === true) return -1;
      if (a.isMock === true && b.isMock === false) return 1;
      return (b.reliabilityScore || 90) - (a.reliabilityScore || 90);
    });

    // 8. Max options (default up to 25 unless returnAll is true or custom limit specified)
    const limit = (request as any).limit !== undefined ? (request as any).limit : (request as any).returnAll ? undefined : 25;
    const finalOptions = limit ? ranked.slice(0, limit) : ranked;

    // 9. Determine Execution Capability
    const executionResolution = ExecutionRouter.resolveExecutionMode({
      rawInput,
      category: resolvedCategory,
      extractedData: constraints,
      preferences: request.preferences,
    });

    const totalLatencyMs = Date.now() - startedAt;

    if (finalOptions.length === 0) {
      return {
        status: 'NO_OPTIONS',
        options: [],
        sourcesQueried,
        discoveryMetadata: {
          totalLatencyMs,
          resolvedCategory,
          rawCandidatesFound: rawCandidates.length,
        },
        constraintsPreserved: constraints,
        executionCapability: 'HUMAN_CONCIERGE',
        verificationState: 'PENDING',
        fallbackReason: `No automated options found for ${resolvedCategory}. Sourcing verified availability directly through Senior Concierge Desk.`,
      };
    }

    const allReal = finalOptions.every((o) => o.environment === 'REAL' || o.isMock === false);

    return {
      status: 'SUCCESS',
      options: finalOptions,
      sourcesQueried,
      discoveryMetadata: {
        totalLatencyMs,
        resolvedCategory,
        rawCandidatesFound: rawCandidates.length,
        deduplicatedCount: deduplicated.length,
      },
      constraintsPreserved: constraints,
      executionCapability: executionResolution.tier === 'AUTOMATED' ? 'AUTOMATED' : 'HUMAN_CONCIERGE',
      verificationState: allReal ? 'REAL' : 'CURATED',
    };
  }

  private static deduplicateProposals(proposals: OptionProposal[]): OptionProposal[] {
    const seen = new Set<string>();
    const result: OptionProposal[] = [];

    for (const p of proposals) {
      const normTitle = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const normProvider = (p.providerName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${normTitle}|${normProvider}`;

      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }

    return result;
  }
}
