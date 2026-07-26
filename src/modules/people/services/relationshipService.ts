import type { Interaction, Person, RelationshipMetadata } from "../types";

export interface AttentionPulse {
  status: "healthy" | "due" | "overdue" | "dormant";
  daysSinceLastContact: number | null;
  daysOverdue: number;
  cadenceDays: number;
}

/**
 * Calculates the authoritative last meaningful contact timestamp from interactions.
 * Automatically filters out non-meaningful interactions (e.g. system pings).
 */
export function calculateLastContact(interactions: Interaction[]): {
  lastContactAt: string | null;
  interactionId: string | null;
} {
  const meaningfulInteractions = interactions
    .filter((int) => int.isMeaningful)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (meaningfulInteractions.length === 0) {
    return { lastContactAt: null, interactionId: null };
  }

  const newest = meaningfulInteractions[0];
  return {
    lastContactAt: newest.timestamp,
    interactionId: newest.id,
  };
}

/**
 * Computes the number of days passed since a given ISO timestamp.
 */
export function calculateDaysSinceContact(lastContactAt: string | null): number | null {
  if (!lastContactAt) return null;
  const contactDate = new Date(lastContactAt).getTime();
  const now = Date.now();
  const diffMs = now - contactDate;
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines if contact is overdue according to target communication cadence.
 */
export function isCadenceOverdue(lastContactAt: string | null, cadenceDays: number = 30): boolean {
  const daysSince = calculateDaysSinceContact(lastContactAt);
  if (daysSince === null) return true; // No record of contact yet
  return daysSince > cadenceDays;
}

/**
 * Computes relationship pulse health metrics for dashboard widgets.
 */
export function calculateAttentionPulse(
  relationship: RelationshipMetadata,
  interactions: Interaction[]
): AttentionPulse {
  const cadence = relationship.communicationCadenceDays || 30;

  // Prefer dynamic calculation from interactions if available, fallback to relationship record value
  const dynamicLastContact = calculateLastContact(interactions).lastContactAt;
  const effectiveLastContact = dynamicLastContact || relationship.lastMeaningfulContactAt || null;

  const daysSince = calculateDaysSinceContact(effectiveLastContact);

  if (relationship.status === "dormant" || relationship.status === "archived") {
    return {
      status: "dormant",
      daysSinceLastContact: daysSince,
      daysOverdue: 0,
      cadenceDays: cadence,
    };
  }

  if (daysSince === null) {
    return {
      status: "overdue",
      daysSinceLastContact: null,
      daysOverdue: cadence,
      cadenceDays: cadence,
    };
  }

  const daysOverdue = Math.max(0, daysSince - cadence);

  if (daysOverdue === 0 && daysSince >= cadence * 0.8) {
    return {
      status: "due",
      daysSinceLastContact: daysSince,
      daysOverdue: 0,
      cadenceDays: cadence,
    };
  }

  if (daysOverdue > 0) {
    return {
      status: "overdue",
      daysSinceLastContact: daysSince,
      daysOverdue,
      cadenceDays: cadence,
    };
  }

  return {
    status: "healthy",
    daysSinceLastContact: daysSince,
    daysOverdue: 0,
    cadenceDays: cadence,
  };
}
