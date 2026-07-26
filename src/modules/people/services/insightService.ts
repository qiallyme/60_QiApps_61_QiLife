import type { Interaction, Person, PersonInsight, RelatedRecordReference } from "../types";
import { calculateDaysSinceContact, calculateLastContact } from "./relationshipService";

/**
 * Generates evidence-backed relationship insights for a given Person.
 * Insights are derived suggestions, NOT verified facts.
 */
export function generateDerivedInsights(
  person: Person,
  interactions: Interaction[],
  relatedRecords: RelatedRecordReference[] = []
): PersonInsight[] {
  const insights: PersonInsight[] = [];
  const nowIso = new Date().toISOString();

  // 1. Cadence Overdue Check
  const cadence = person.relationship.communicationCadenceDays || 30;
  const { lastContactAt, interactionId } = calculateLastContact(interactions);
  const effectiveLastContact = lastContactAt || person.relationship.lastMeaningfulContactAt || null;
  const daysSince = calculateDaysSinceContact(effectiveLastContact);

  if (person.relationship.status === "active" && (daysSince === null || daysSince > cadence)) {
    const statement =
      daysSince === null
        ? `No recorded meaningful contact yet (Target cadence: ${cadence} days)`
        : `No meaningful contact in ${daysSince} days (Target cadence: ${cadence} days)`;

    insights.push({
      id: `ins-cadence-${person.id}`,
      personId: person.id,
      kind: "cadence_overdue",
      statement,
      status: "active",
      confidence: 0.95,
      generatedAt: nowIso,
      evidence: [
        {
          sourceRecordId: interactionId || person.id,
          entityType: interactionId ? "interaction" : "person",
          description: effectiveLastContact
            ? `Last meaningful interaction occurred on ${new Date(effectiveLastContact).toLocaleDateString()}`
            : "No previous qualifying interactions recorded",
          timestamp: effectiveLastContact || undefined,
        },
      ],
    });
  }

  // 2. Open Promises & Follow-ups Check
  const pendingFollowUps = (person.relationship.followUps || []).filter((fu) => !fu.isCompleted);
  if (pendingFollowUps.length > 0) {
    insights.push({
      id: `ins-followups-${person.id}`,
      personId: person.id,
      kind: "unresolved_followups",
      statement: `${pendingFollowUps.length} unresolved follow-up action(s) pending`,
      status: "active",
      confidence: 0.9,
      generatedAt: nowIso,
      evidence: pendingFollowUps.map((fu) => ({
        sourceRecordId: fu.id,
        entityType: "follow_up",
        description: `Follow-up: "${fu.title}" (${fu.direction === "owed_by_me" ? "Owed by you" : "Owed to you"})`,
        timestamp: fu.createdAt,
      })),
    });
  }

  // 3. High Communication Activity Burst
  const recentInteractions = interactions.filter((int) => {
    const diff = Date.now() - new Date(int.timestamp).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000; // Last 7 days
  });

  if (recentInteractions.length >= 3) {
    insights.push({
      id: `ins-activity-burst-${person.id}`,
      personId: person.id,
      kind: "activity_burst",
      statement: `Increased communication activity detected (${recentInteractions.length} interactions in past 7 days)`,
      status: "active",
      confidence: 0.85,
      generatedAt: nowIso,
      evidence: recentInteractions.map((int) => ({
        sourceRecordId: int.id,
        entityType: "interaction",
        description: `${int.type.toUpperCase()}: ${int.summary}`,
        timestamp: int.timestamp,
      })),
    });
  }

  // 4. Linked Journal Mentions
  const journalMentions = relatedRecords.filter((rec) => rec.entityType === "journal");
  if (journalMentions.length > 0) {
    insights.push({
      id: `ins-journal-mentions-${person.id}`,
      personId: person.id,
      kind: "journal_references",
      statement: `Referenced in ${journalMentions.length} QiLife Journal entry/entries`,
      status: "active",
      confidence: 0.9,
      generatedAt: nowIso,
      evidence: journalMentions.map((rec) => ({
        sourceRecordId: rec.id,
        entityType: "journal",
        description: `Journal entry: "${rec.title}"`,
        timestamp: rec.timestamp,
      })),
    });
  }

  return insights;
}
