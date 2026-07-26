import type { GoogleContactSnapshot } from "../types";
import { mockGoogleContactSnapshotFixture } from "../fixtures";

export interface GoogleContactWriteInput {
  names: { givenName: string; familyName?: string }[];
  emails?: { value: string; label?: string }[];
  phones?: { value: string; label?: string }[];
  organizations?: { name: string; title?: string }[];
}

export interface GoogleContactsGateway {
  findContacts(query: string): Promise<GoogleContactSnapshot[]>;
  getContact(resourceName: string): Promise<GoogleContactSnapshot>;
  createContact(input: GoogleContactWriteInput): Promise<GoogleContactSnapshot>;
  updateContact(
    resourceName: string,
    input: GoogleContactWriteInput
  ): Promise<GoogleContactSnapshot>;
}

/**
 * Fake implementation of GoogleContactsGateway for local testing and UI development.
 * Never connects to live OAuth or stores tokens.
 */
export class FakeGoogleContactsGateway implements GoogleContactsGateway {
  private contacts: Map<string, GoogleContactSnapshot> = new Map([
    [mockGoogleContactSnapshotFixture.resourceName, mockGoogleContactSnapshotFixture],
  ]);

  async findContacts(query: string): Promise<GoogleContactSnapshot[]> {
    const q = query.toLowerCase();
    return Array.from(this.contacts.values()).filter((c) =>
      c.names.some(
        (n) =>
          n.displayName?.toLowerCase().includes(q) ||
          n.givenName.toLowerCase().includes(q) ||
          n.familyName?.toLowerCase().includes(q)
      )
    );
  }

  async getContact(resourceName: string): Promise<GoogleContactSnapshot> {
    const contact = this.contacts.get(resourceName);
    if (!contact) {
      // Fallback to fixture for preview
      return {
        ...mockGoogleContactSnapshotFixture,
        resourceName,
      };
    }
    return contact;
  }

  async createContact(input: GoogleContactWriteInput): Promise<GoogleContactSnapshot> {
    const resourceName = `people/c_fake_${Date.now()}`;
    const snapshot: GoogleContactSnapshot = {
      resourceName,
      etag: `%fake_${Date.now()}`,
      names: input.names.map((n) => ({
        givenName: n.givenName,
        familyName: n.familyName,
        displayName: [n.givenName, n.familyName].filter(Boolean).join(" "),
      })),
      emails: input.emails || [],
      phones: input.phones || [],
      addresses: [],
      organizations: input.organizations || [],
      birthdays: [],
      updatedAt: new Date().toISOString(),
    };
    this.contacts.set(resourceName, snapshot);
    return snapshot;
  }

  async updateContact(
    resourceName: string,
    input: GoogleContactWriteInput
  ): Promise<GoogleContactSnapshot> {
    const existing = await this.getContact(resourceName);
    const updated: GoogleContactSnapshot = {
      ...existing,
      names: input.names.map((n) => ({
        givenName: n.givenName,
        familyName: n.familyName,
        displayName: [n.givenName, n.familyName].filter(Boolean).join(" "),
      })),
      emails: input.emails || existing.emails,
      phones: input.phones || existing.phones,
      organizations: input.organizations || existing.organizations,
      updatedAt: new Date().toISOString(),
    };
    this.contacts.set(resourceName, updated);
    return updated;
  }
}
