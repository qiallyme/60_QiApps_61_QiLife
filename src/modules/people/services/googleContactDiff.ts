import type { GoogleContactFieldDiff, GoogleContactSnapshot, GoogleContactSyncPlan, Person, SyncResolution } from "../types";
import { personToGoogleSnapshot } from "./googleContactMapper";

/**
 * Generates field-level diffs comparing portable address-book attributes.
 * Never compares private QiLife fields (insights, journal links, promises, boundaries).
 */
export function generateGoogleContactDiff(
  person: Person,
  snapshot: GoogleContactSnapshot
): GoogleContactFieldDiff[] {
  const diffs: GoogleContactFieldDiff[] = [];
  const qiSnap = personToGoogleSnapshot(person);

  // 1. Name Diff
  const qiName = qiSnap.names[0]?.displayName || "";
  const gName = snapshot.names[0]?.displayName || snapshot.names[0]?.givenName || "";
  diffs.push({
    field: "Full Name",
    qilifeValue: qiName || null,
    googleValue: gName || null,
    status:
      qiName === gName
        ? "match"
        : !qiName
        ? "google_only"
        : !gName
        ? "qilife_only"
        : "conflict",
  });

  // 2. Email Diff
  const qiEmail = qiSnap.emails.map((e) => e.value).sort().join(", ");
  const gEmail = snapshot.emails.map((e) => e.value).sort().join(", ");
  diffs.push({
    field: "Email Addresses",
    qilifeValue: qiEmail || null,
    googleValue: gEmail || null,
    status:
      qiEmail === gEmail
        ? "match"
        : !qiEmail
        ? "google_only"
        : !gEmail
        ? "qilife_only"
        : "conflict",
  });

  // 3. Phone Diff
  const qiPhone = qiSnap.phones.map((p) => p.value).sort().join(", ");
  const gPhone = snapshot.phones.map((p) => p.value).sort().join(", ");
  diffs.push({
    field: "Phone Numbers",
    qilifeValue: qiPhone || null,
    googleValue: gPhone || null,
    status:
      qiPhone === gPhone
        ? "match"
        : !qiPhone
        ? "google_only"
        : !gPhone
        ? "qilife_only"
        : "conflict",
  });

  // 4. Organization / Job Title Diff
  const qiOrg = qiSnap.organizations[0] ? `${qiSnap.organizations[0].name} (${qiSnap.organizations[0].title || ""})` : "";
  const gOrg = snapshot.organizations[0] ? `${snapshot.organizations[0].name} (${snapshot.organizations[0].title || ""})` : "";
  diffs.push({
    field: "Organization & Title",
    qilifeValue: qiOrg || null,
    googleValue: gOrg || null,
    status:
      qiOrg === gOrg
        ? "match"
        : !qiOrg
        ? "google_only"
        : !gOrg
        ? "qilife_only"
        : "conflict",
  });

  // 5. Birthday Diff
  const qiBday = qiSnap.birthdays[0]?.text || "";
  const gBday = snapshot.birthdays[0]?.text || "";
  diffs.push({
    field: "Birthday",
    qilifeValue: qiBday || null,
    googleValue: gBday || null,
    status:
      qiBday === gBday
        ? "match"
        : !qiBday
        ? "google_only"
        : !gBday
        ? "qilife_only"
        : "conflict",
  });

  return diffs;
}

/**
 * Creates a reviewable sync resolution plan with default recommended actions.
 */
export function createSyncPlan(
  person: Person,
  snapshot: GoogleContactSnapshot,
  customResolutions: Record<string, SyncResolution> = {}
): GoogleContactSyncPlan {
  const diffs = generateGoogleContactDiff(person, snapshot);
  const resolutions: Record<string, SyncResolution> = {};

  diffs.forEach((diff) => {
    if (customResolutions[diff.field]) {
      resolutions[diff.field] = customResolutions[diff.field];
    } else if (diff.status === "match") {
      resolutions[diff.field] = "skip";
    } else if (diff.status === "qilife_only") {
      resolutions[diff.field] = "keep_qilife";
    } else if (diff.status === "google_only") {
      resolutions[diff.field] = "use_google";
    } else {
      resolutions[diff.field] = "keep_qilife"; // Default conflict resolution policy: QiLife is truth
    }
  });

  return {
    personId: person.id,
    googleResourceName: snapshot.resourceName,
    diffs,
    resolutions,
    generatedAt: new Date().toISOString(),
  };
}
