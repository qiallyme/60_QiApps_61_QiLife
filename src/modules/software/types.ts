export interface SoftwareDraft {
  provider: string;
  title: string;
  description: string;
  status: string;
  loginEmail: string;
  username: string;
  primaryUrl: string;
  adminUrl: string;
  plan: string;
  billingCadence: string;
  renewalDate: string;
  ownerAdministrator: string;
  organizationWorkspace: string;
  supportContact: string;
  notes: string;
  sensitivity: "public" | "private" | "sensitive" | "restricted";
  lastVerifiedAt: string;
}

export interface SoftwareFilters {
  query: string;
  provider: string;
  status: string;
  renewal: "" | "approaching" | "overdue" | "none";
  verification: "" | "recent" | "needs_verification";
  includeArchived: boolean;
  today: string;
}
