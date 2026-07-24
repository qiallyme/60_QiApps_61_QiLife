import { archiveRecord, createRecord, listAllRecords, listRecords, updateRecord } from "../../../features/qilife/services/qilifeStore";
import type { QiRecord } from "../../../features/qilife/types";
import type { CreatePersonInput, Interaction, PeopleQuery, Person, PersonInsight, RelatedRecordReference, UpdatePersonInput } from "../types";
import { mockInteractionsFixtures, mockPeopleFixtures, mockRelatedRecordsFixtures } from "../fixtures";
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
    let people = rawRecords.map(toPerson);

    // If local store has no people records yet, return fixtures for rich preview
    if (people.length === 0) {
      people = mockPeopleFixtures;
    }

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
    const all = await this.list();
    const person = all.find((p) => p.id === id);
    return person || null;
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
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found.`);

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

    // Synthesize existing QiRecord structure for mapper
    const fakeExistingRecord: QiRecord = {
      id: existing.id,
      entity_key: PERSON_ENTITY_KEY,
      title: existing.name.formattedName,
      data: existing._unknownFields || {},
    };

    const qiPatch = toQiUpdateRecordInput(updatedPerson, fakeExistingRecord);
    const savedRecord = await updateRecord(id, qiPatch);
    return toPerson(savedRecord);
  }

  async archive(id: string): Promise<void> {
    await archiveRecord(id);
  }

  async listInteractions(personId: string): Promise<Interaction[]> {
    const records = await listRecords(INTERACTION_ENTITY_KEY);
    const interactions = records.map(toInteraction).filter((int) => int.personId === personId);
    if (interactions.length === 0) {
      return mockInteractionsFixtures.filter((int) => int.personId === personId);
    }
    return interactions;
  }

  async addInteraction(interaction: Omit<Interaction, "id">): Promise<Interaction> {
    const qiInput = toQiInteractionRecordInput(interaction);
    const created = await createRecord(qiInput);
    return toInteraction(created);
  }

  async listRelatedRecords(personId: string): Promise<RelatedRecordReference[]> {
    // In future phases, this queries shared records linked to personId.
    // For scaffold preview, return rich mock cross-module links.
    return mockRelatedRecordsFixtures;
  }

  async getInsights(personId: string): Promise<PersonInsight[]> {
    const person = await this.getById(personId);
    if (!person) return [];

    const interactions = await this.listInteractions(personId);
    const related = await this.listRelatedRecords(personId);
    return generateDerivedInsights(person, interactions, related);
  }
}
