import { HomeServiceRequest, HomeTechnicianProfile } from './types';
import { homeDataStore } from './repository';

export interface TechnicianMatchScore {
  technician: HomeTechnicianProfile;
  totalScore: number; // 0 - 100
  reasons: string[];
  distanceCategory: 'SAME_LOCALITY' | 'ADJACENT_ZONE' | 'EXTENDED_RADIUS';
  isPreferredByCustomer: boolean;
  isAvailableNow: boolean;
}

/**
 * Intelligent Technician Allocation & Recommendation Engine
 * Dispatches verified local technicians based on skill compatibility, locality proximity,
 * customer continuity, rating pedigree, and real-time workload balancing.
 */
export class HomeAllocationEngine {
  /**
   * Evaluates and ranks candidate technicians for an incoming service request.
   */
  public static recommendTechniciansForRequest(request: HomeServiceRequest): TechnicianMatchScore[] {
    const allTechnicians = homeDataStore.getAllTechnicians({ approvedOnly: true });
    const customer = homeDataStore.getCustomerById(request.customerId);

    const matches: TechnicianMatchScore[] = [];

    for (const tech of allTechnicians) {
      // Hard filter: Must handle this service category
      const handlesCategory = tech.serviceCategories.includes(request.categoryKey);
      if (!handlesCategory) continue;

      let score = 0;
      const reasons: string[] = [];

      // 1. Skill & Category Match (Max 30 pts)
      score += 25;
      reasons.push(`Qualified partner in ${request.categoryKey}`);

      // Check for specific skill mention
      const hasSpecificSkill = tech.primarySkills.some(skill => 
        request.serviceName.toLowerCase().includes(skill.toLowerCase()) ||
        request.issueDescription.toLowerCase().includes(skill.toLowerCase())
      );
      if (hasSpecificSkill) {
        score += 5;
        reasons.push('Direct skill match with reported issue');
      }

      // 2. Locality & Travel Distance (Max 35 pts)
      let distanceCategory: 'SAME_LOCALITY' | 'ADJACENT_ZONE' | 'EXTENDED_RADIUS' = 'EXTENDED_RADIUS';
      const reqLocality = request.address.locality.toLowerCase().trim();
      const techLocality = tech.operatingLocality.toLowerCase().trim();

      if (reqLocality.includes(techLocality) || techLocality.includes(reqLocality)) {
        score += 35;
        distanceCategory = 'SAME_LOCALITY';
        reasons.push(`Based locally in ${tech.operatingLocality} (< 15 min response)`);
      } else {
        score += 20;
        distanceCategory = 'ADJACENT_ZONE';
        reasons.push(`Covers ${request.address.locality} within ${tech.serviceRadiusKm}km operational radius`);
      }

      // 3. Customer Continuity & Past Preference (Max 15 pts)
      const isPreferred = customer?.preferredTechnicianId === tech.id;
      if (isPreferred) {
        score += 15;
        reasons.push('Preferred technician previously requested by customer');
      }

      // 4. Rating & Quality History (Max 15 pts)
      // ratingAverage is 1 to 5. Multiply by 3 => max 15.
      const ratingContribution = Math.round((tech.ratingAverage / 5) * 15);
      score += ratingContribution;
      if (tech.ratingAverage >= 4.8) {
        reasons.push(`Exceptional performance rating (${tech.ratingAverage} ★ over ${tech.ratingCount} reviews)`);
      }

      // 5. Workload & Availability Check (Max 5 pts)
      const isAvailableNow = tech.isAvailableForDispatch && !tech.activeJobId;
      if (isAvailableNow) {
        score += 5;
        reasons.push('Available immediately for appointment slot');
      } else {
        score -= 10;
        reasons.push('Currently assigned to active emergency dispatch');
      }

      matches.push({
        technician: tech,
        totalScore: Math.min(100, Math.max(0, score)),
        reasons,
        distanceCategory,
        isPreferredByCustomer: isPreferred,
        isAvailableNow
      });
    }

    // Rank descending by total score
    return matches.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Automatically assigns the top scored technician if confidence >= 70
   */
  public static autoDispatchIfEligible(requestId: string): { assigned: boolean; technicianId?: string; score?: number } {
    const req = homeDataStore.getRequestById(requestId);
    if (!req || req.status !== 'SUBMITTED') {
      return { assigned: false };
    }

    const matches = this.recommendTechniciansForRequest(req);
    const topMatch = matches[0];

    if (topMatch && topMatch.totalScore >= 70 && topMatch.isAvailableNow) {
      homeDataStore.assignTechnician(req.id, topMatch.technician.id);
      return {
        assigned: true,
        technicianId: topMatch.technician.id,
        score: topMatch.totalScore
      };
    }

    return { assigned: false };
  }
}
