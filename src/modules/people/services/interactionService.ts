import type { QiCreateRecordInput, QiRecord } from "../../../features/qilife/types";
import type { Interaction, InteractionDirection, InteractionType } from "../types";

export const INTERACTION_ENTITY_KEY = "person_interaction";

/**
 * Converts a generic QiRecord into an Interaction domain object.
 */
export function toInteraction(record: QiRecord): Interaction {
  const d = (record.data || {}) as Record<string, unknown>;

  return {
    id: record.id,
    personId: (d.personId as string) || "",
    timestamp: (d.timestamp as string) || record.created_at || new Date().toISOString(),
    type: (d.type as InteractionType) || "check_in",
    direction: (d.direction as InteractionDirection) || "mutual",
    summary: record.title || (d.summary as string) || "Interaction Record",
    body: d.body as string | undefined,
    isMeaningful: typeof d.isMeaningful === "boolean" ? d.isMeaningful : true,
    sourceModule: (d.sourceModule as string) || "people",
    relatedRecordIds: Array.isArray(d.relatedRecordIds) ? (d.relatedRecordIds as string[]) : [],
    followUpId: d.followUpId as string | undefined,
    externalMetadata: d.externalMetadata as Record<string, unknown> | undefined,
  };
}

/**
 * Converts an Interaction into a QiCreateRecordInput for persistence.
 */
export function toQiInteractionRecordInput(interaction: Omit<Interaction, "id">): QiCreateRecordInput {
  return {
    entity_key: INTERACTION_ENTITY_KEY,
    title: interaction.summary,
    data: {
      personId: interaction.personId,
      timestamp: interaction.timestamp,
      type: interaction.type,
      direction: interaction.direction,
      summary: interaction.summary,
      body: interaction.body,
      isMeaningful: interaction.isMeaningful,
      sourceModule: interaction.sourceModule || "people",
      relatedRecordIds: interaction.relatedRecordIds || [],
      followUpId: interaction.followUpId,
      externalMetadata: interaction.externalMetadata,
    },
  };
}

/**
 * Returns a human-friendly label for interaction types.
 */
export function formatInteractionType(type: InteractionType): string {
  const labels: Record<InteractionType, string> = {
    call: "Phone Call",
    text: "Text / SMS",
    email: "Email Message",
    meeting: "Meeting",
    visit: "In-Person Visit",
    favor: "Favor / Assistance",
    conflict: "Conflict / Discussion",
    check_in: "Check-in",
    shared_event: "Shared Event",
  };
  return labels[type] || type;
}

/**
 * Returns a human-friendly direction label.
 */
export function formatInteractionDirection(direction: InteractionDirection): string {
  const labels: Record<InteractionDirection, string> = {
    inbound: "Received",
    outbound: "Sent",
    mutual: "Interactive",
    internal_note: "Private Note",
  };
  return labels[direction] || direction;
}
