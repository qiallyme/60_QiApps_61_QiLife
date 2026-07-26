import type { Person, Interaction, PersonInsight, RelatedRecordReference, GoogleContactSnapshot } from "./types";

export const mockPeopleFixtures: Person[] = [
  {
    id: "person-101",
    name: {
      givenName: "Elena",
      familyName: "Rostova",
      preferredName: "Elena",
      formattedName: "Elena Rostova",
    },
    contactMethods: [
      {
        id: "cm-1",
        kind: "email",
        label: "Work Email",
        value: "elena.rostova@qilabs.org",
        isPrimary: true,
        verificationState: "verified",
      },
      {
        id: "cm-2",
        kind: "mobile_phone",
        label: "Mobile",
        value: "+1 (555) 234-5678",
        isPrimary: true,
      },
    ],
    addresses: [
      {
        id: "addr-1",
        label: "Office",
        street: "100 Innovation Way",
        city: "San Francisco",
        stateProvince: "CA",
        postalCode: "94105",
        isPrimary: true,
      },
    ],
    organization: {
      organizationName: "QiLabs Research",
      jobTitle: "Principal Investigator",
      roleType: "partner",
    },
    birthday: "1988-04-12",
    relationship: {
      category: "colleague",
      status: "active",
      attentionLevel: "high",
      firstKnownDate: "2024-01-15",
      lastMeaningfulContactAt: "2026-06-10T14:30:00Z",
      nextDesiredContactAt: "2026-07-25T10:00:00Z",
      communicationCadenceDays: 14,
      tags: ["research", "partner", "qilife-core"],
      privateNotes: "Prefers morning syncs over email. Direct communication style.",
      boundaries: ["No late evening calls after 7 PM"],
      thingsOwedToThem: ["Send revised architecture brief for QiLife CRM"],
      thingsOwedToMe: ["Feedback on Journal integration schema"],
      openPromises: ["Follow up after next sprint milestone"],
      followUps: [
        {
          id: "fu-1",
          personId: "person-101",
          title: "Send revised architecture brief for QiLife CRM",
          dueDate: "2026-07-26",
          isCompleted: false,
          direction: "owed_by_me",
          createdAt: "2026-07-20T10:00:00Z",
        },
      ],
    },
    userNotes: "Key collaborator on QiLife Life OS platform.",
    googleLink: {
      resourceName: "people/c1234567890",
      etag: "%12345678",
      lastSyncedAt: "2026-07-01T09:00:00Z",
      syncStatus: "diff_detected",
    },
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "person-102",
    name: {
      givenName: "Marcus",
      familyName: "Vance",
      preferredName: "Marcus",
      formattedName: "Marcus Vance",
    },
    contactMethods: [
      {
        id: "cm-3",
        kind: "email",
        label: "Personal Email",
        value: "marcus.vance@example.com",
        isPrimary: true,
      },
      {
        id: "cm-4",
        kind: "mobile_phone",
        label: "Cell",
        value: "+1 (555) 987-6543",
        isPrimary: true,
      },
    ],
    addresses: [],
    organization: {
      organizationName: "Vance Capital",
      jobTitle: "Managing Director",
      roleType: "client",
    },
    relationship: {
      category: "client",
      status: "active",
      attentionLevel: "medium",
      firstKnownDate: "2025-03-20",
      lastMeaningfulContactAt: "2026-05-01T11:00:00Z",
      nextDesiredContactAt: "2026-07-15T00:00:00Z",
      communicationCadenceDays: 30,
      tags: ["investor", "client", "advisory"],
      boundaries: [],
      thingsOwedToThem: [],
      thingsOwedToMe: ["Quarterly advisory check-in schedule"],
      openPromises: [],
      followUps: [],
    },
    userNotes: "Strategic advisor for growth milestones.",
    createdAt: "2025-03-20T10:00:00Z",
    updatedAt: "2026-07-01T12:00:00Z",
  },
];

export const mockInteractionsFixtures: Interaction[] = [
  {
    id: "int-1",
    personId: "person-101",
    timestamp: "2026-06-10T14:30:00Z",
    type: "meeting",
    direction: "mutual",
    summary: "Sprint Sync & Architecture Discussion",
    body: "Discussed shared record model and journal branch integration strategy.",
    isMeaningful: true,
    sourceModule: "people",
  },
  {
    id: "int-2",
    personId: "person-101",
    timestamp: "2026-07-18T09:15:00Z",
    type: "email",
    direction: "outbound",
    summary: "Automated status ping",
    body: "System notifications regarding build completion.",
    isMeaningful: false,
    sourceModule: "system",
  },
];

export const mockInsightsFixtures: PersonInsight[] = [
  {
    id: "ins-1",
    personId: "person-101",
    kind: "cadence_overdue",
    statement: "No meaningful contact in 44 days (Target cadence: 14 days)",
    status: "active",
    confidence: 0.95,
    generatedAt: "2026-07-24T00:00:00Z",
    evidence: [
      {
        sourceRecordId: "int-1",
        entityType: "interaction",
        description: "Last meaningful contact was on June 10, 2026",
        timestamp: "2026-06-10T14:30:00Z",
      },
    ],
  },
];

export const mockRelatedRecordsFixtures: RelatedRecordReference[] = [
  {
    id: "rec-1",
    entityType: "journal",
    title: "QiLife CRM Architecture Planning Entry",
    timestamp: "2026-07-24T00:10:00Z",
    summary: "Notes on isolated worktree setup and shared record mapping for Elena Rostova.",
    sourceModule: "journal",
    relationshipType: "mentioned_in",
  },
  {
    id: "rec-2",
    entityType: "task",
    title: "Review QiLife CRM domain types with Elena",
    timestamp: "2026-07-25T10:00:00Z",
    summary: "Action item to review relationship cadence models.",
    sourceModule: "tasks",
    relationshipType: "assigned_to",
  },
];

export const mockGoogleContactSnapshotFixture: GoogleContactSnapshot = {
  resourceName: "people/c1234567890",
  etag: "%12345678",
  names: [{ givenName: "Elena", familyName: "Rostova", displayName: "Elena Rostova" }],
  emails: [{ value: "elena.rostova@qilabs.org", label: "Work", isPrimary: true }],
  phones: [{ value: "+1 (555) 234-5678", label: "Mobile", isPrimary: true }, { value: "+1 (555) 000-1111", label: "Office" }],
  addresses: [{ formattedValue: "100 Innovation Way, San Francisco, CA 94105", city: "San Francisco", state: "CA" }],
  organizations: [{ name: "QiLabs Research Inc.", title: "Principal Investigator & Director" }],
  birthdays: [{ text: "1988-04-12", year: 1988, month: 4, day: 12 }],
};
