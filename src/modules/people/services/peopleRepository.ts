import { archiveRecord, createRecord, listAllRecords, listRecords, updateRecord } from "../../../features/qilife/services/qilifeStore";
import type { CreatePersonInput, Interaction, PeopleQuery, Person, PersonInsight, RelatedRecordReference, UpdatePersonInput } from "../types";
import { generateDerivedInsights } from "./insightService";
import { INTERACTION_ENTITY_KEY, toInteraction, toQiInteractionRecordInput } from "./interactionService";
import { PERSON_ENTITY_KEY, toPerson, toQiCreateRecordInput, toQiUpdateRecordInput } from "./personRecordMapper";
import { calculateAttentionPulse, calculateDaysSinceContact } from "./relationshipService";

export interface PeopleRepository {
  list(query?: PeopleQuery): Promise<Person[]>;
  getById(id: string): Promise<Person | null>;
  create(input: CreatePersonInput): Promise<Person>;
  update(id: string, patch: UpdatePersonInput): Promise<Person>;
  archive(id: string): Promise<void>;
  listInteractions(personId: string): Promise<Interaction[]>;
  addInteraction(interaction: Omit<Interaction, "id">): Promise<Interaction>;
  listRelatedRecords(personId: string): Promise<RelatedRecordReference[]>;
  getInsights(personId: string): Promise<PersonInsight[]>;
}

export class QiLifePeopleRepository implements PeopleRepository {
  async list(query?: PeopleQuery): Promise<Person[]> {
    const rawRecords = await listRecords(PERSON_ENTITY_KEY);
    const people = rawRecords.map(toPerson);

    if (!query) return people;

    return people.filter((p) => {
      if (query.search) {
        const q = query.search.toLowerCase();
        const matchesName = p.name.formattedName.toLowerCase().includes(q) || p.name.givenName.toLowerCase().includes(q);
        const matchesOrg = p.organization?.organizationName.toLowerCase().includes(q);
        const matchesEmail = p.contactMethods.some((cm) => cm.value.toLowerCase().includes(q));
        if (!matchesName && !matchesOrg && !matchesEmail) return false;
      }

      if (query.category && p.relationship.category !== query.category) return false;
      if (query.status && p.relationship.status !== query.status) return false;
      if (query.attentionLevel && p.relationship.attentionLevel !== query.attentionLevel) return false;
      if (query.tag && !p.relationship.tags.includes(query.tag)) return false;

      if (query.needsContact) {
        const pulse = calculateAttentionPulse(p.relationship, []);
        if (pulse.status !== "overdue" && pulse.status !== "due") return false;
      }

      return true;
    });
  }

  async getById(id: string): Promise<Person | null> {
    const records = await listRecords(PERSON_ENTITY_KEY);
    const record = records.find((item) => item.id === id);
    return record ? toPerson(record) : null;
  }

  async create(input: CreatePersonInput): Promise<Person> {
    const defaultRelationship = {
      category: "acquaintance" as const,
      status: "active" as const,
      attentionLevel: "medium" as const,
      communicationCadenceDays: 30,
      tags: [],
      ...(input.relationship || {}),
    };

    const draft: Omit<Person, "id" | "createdAt" | "updatedAt"> = {
      name: input.name,
      contactMethods: input.contactMethods || [],
      addresses: input.addresses || [],
      organization: input.organization,
      birthday: input.birthday,
      relationship: defaultRelationship,
      userNotes: input.userNotes,
    };

    const qiInput = toQiCreateRecordInput(draft);
    const created = await createRecord(qiInput);
    return toPerson(created);
  }

  async update(id: string, patch: UpdatePersonInput): Promise<Person> {
    const records = await listRecords(PERSON_ENTITY_KEY);
    const existingRecord = records.find((item) => item.id === id);
    if (!existingRecord) throw new Error(`Person with id ${id} not found.`);
    const existing = toPerson(existingRecord);

    const updatedPerson: Person = {
      ...existing,
      name: { ...existing.name, ...(patch.name || {}) },
      contactMethods: patch.contactMethods || existing.contactMethods,
      addresses: patch.addresses || existing.addresses,
      organization: patch.organization !== undefined ? patch.organization : existing.organization,
      birthday: patch.birthday !== undefined ? patch.birthday : existing.birthday,
      userNotes: patch.userNotes !== undefined ? patch.userNotes : existing.userNotes,
      relationship: { ...existing.relationship, ...(patch.relationship || {}) },
      updatedAt: new Date().toISOString(),
    };

    const qiPatch = toQiUpdateRecordInput(updatedPerson, existingRecord);
    const savedRecord = await updateRecord(id, qiPatch);
    return toPerson(savedRecord);
  }

  async archive(id: string): Promise<void> {
    await archiveRecord(id);
  }

  async listInteractions(personId: string): Promise<Interaction[]> {
    const records = await listRecords(INTERACTION_ENTITY_KEY);
    return records.map(toInteraction).filter((interaction) => interaction.personId === personId);
  }

  async addInteraction(interaction: Omit<Interaction, "id">): Promise<Interaction> {
    const qiInput = toQiInteractionRecordInput(interaction);
    const created = await createRecord(qiInput);
    return toInteraction(created);
  }

  async listRelatedRecords(personId: string): Promise<RelatedRecordReference[]> {
    const records = await listAllRecords();
    return records
      .filter((record) => (
        record.entity_key !== PERSON_ENTITY_KEY
        && Array.isArray(record.data.people_ids)
        && record.data.people_ids.includes(personId)
      ))
      .map((record) => {
        const entityType = record.entity_key === "journal_entry"
          ? "journal"
          : record.entity_key;
        const routePrefix: Record<string, string> = {
          journal_entry: "/journal",
          task: "/tasks",
          thread: "/threads",
          document: "/documents",
        };
        const summaryValue = record.data.summary
          ?? record.data.body_markdown
          ?? record.data.description;

        return {
          id: record.id,
          entityType,
          title: record.title,
          timestamp:
            (typeof record.data.entry_date === "string" && record.data.entry_date)
            || record.updated_at
            || record.created_at
            || new Date(0).toISOString(),
          ...(typeof summaryValue === "string" ? { summary: summaryValue } : {}),
          sourceModule: entityType,
          relationshipType: record.entity_key === "journal_entry" ? "mentioned_in" : "linked_to",
          ...(routePrefix[record.entity_key]
            ? { targetRoute: `${routePrefix[record.entity_key]}/${record.id}` }
            : {}),
        };
      })
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  }

  async getInsights(personId: string): Promise<PersonInsight[]> {
    const person = await this.getById(personId);
    if (!person) return [];

    const interactions = await this.listInteractions(personId);
    const related = await this.listRelatedRecords(personId);
    return generateDerivedInsights(person, interactions, related);
  }
}
