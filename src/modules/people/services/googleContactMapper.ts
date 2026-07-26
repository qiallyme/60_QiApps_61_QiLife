import type { GoogleContactSnapshot, Person } from "../types";

/**
 * Pure mapping from QiLife Person to portable GoogleContactSnapshot.
 * Explicitly excludes private fields (journal links, insights, boundaries, health/financial items, etc.).
 */
export function personToGoogleSnapshot(person: Person): GoogleContactSnapshot {
  const primaryEmail = person.contactMethods.find((cm) => cm.kind === "email" && cm.isPrimary)?.value;
  const emails = person.contactMethods
    .filter((cm) => cm.kind === "email")
    .map((cm) => ({
      value: cm.value,
      label: cm.label,
      isPrimary: cm.isPrimary,
    }));

  const phones = person.contactMethods
    .filter((cm) => cm.kind.includes("phone"))
    .map((cm) => ({
      value: cm.value,
      label: cm.label,
      isPrimary: cm.isPrimary,
    }));

  const addresses = person.addresses.map((addr) => ({
    formattedValue: [addr.street, addr.city, addr.stateProvince, addr.postalCode, addr.country]
      .filter(Boolean)
      .join(", "),
    city: addr.city,
    state: addr.stateProvince,
    country: addr.country,
  }));

  const organizations = person.organization
    ? [{ name: person.organization.organizationName, title: person.organization.jobTitle }]
    : [];

  const birthdays = person.birthday ? [{ text: person.birthday }] : [];

  return {
    resourceName: person.googleLink?.resourceName || "",
    etag: person.googleLink?.etag,
    names: [
      {
        givenName: person.name.givenName,
        familyName: person.name.familyName,
        displayName: person.name.formattedName,
      },
    ],
    emails: emails.length > 0 ? emails : primaryEmail ? [{ value: primaryEmail, isPrimary: true }] : [],
    phones,
    addresses,
    organizations,
    birthdays,
    updatedAt: person.updatedAt,
  };
}
